import { homedir } from 'os';
import { Application, addins } from '../addin';
import { addToOPEN, removeFromOPEN } from '../native/open';
import { enableVBOM } from '../native/vbom';
import {
  addToPATH as _addToPATH,
  removeFromPATH as _removeFromPATH
} from '../native/path';
import { getProcesses } from '../native/processes';
import { join, basename } from '../utils/path';
import { pathExists, remove, symlink } from '../utils/fs';
import env from '../env';
import dedent from 'dedent';

const addins_dir = env.isWindows
  ? join(homedir(), 'AppData', 'Roaming', 'Microsoft', 'Addins')
  : 'TODO';

export interface Operation {
  id: string;
  validate?: () => void;
  run: () => void;
}

export async function setup(operations: Operation[]) {
  for (const operation of operations) {
    if (operation.validate) await operation.validate();
  }
  for (const operation of operations) {
    await operation.run();
  }
}

export function installExcel(): Operation {
  return {
    id: 'install-excel',
    async validate() {
      await appClosed('excel');
      await addinsDirExists();
    },
    async run() {
      await installAddin('excel');
      console.log('Installed Excel.');
    }
  };
}

export function uninstallExcel(): Operation {
  return {
    id: 'uninstall-excel',
    async validate() {
      await appClosed('excel');
      await addinsDirExists();
    },
    async run() {
      await uninstallAddin('excel');
      console.log('Uninstalled Excel.');
    }
  };
}

export function addToPATH(): Operation {
  return {
    id: 'add-to-path',
    async run() {
      await _addToPATH();
      console.log(dedent`
        Added vba-blocks to PATH.
        Note: The shortcut won't be available in the current console,
        restart or open a new console / cmd windows before using it.`);
    }
  };
}

export function removeFromPATH(): Operation {
  return {
    id: 'remove-from-path',
    async run() {
      await _removeFromPATH();
      console.log('Removed vba-blocks from PATH.');
    }
  };
}

export async function appClosed(application: Application) {
  if (env.isWindows) {
    const match = new RegExp(`${application}`, 'i');
    const processes = await getProcesses();

    if (processes.some(name => match.test(name))) {
      throw new Error(
        `${application} must be closed for the vba-blocks add-in to be installed correctly.`
      );
    }
  }
}

export async function addinsDirExists() {
  if (!(await pathExists(addins_dir))) {
    throw new Error(`Add-in directory not found at "${addins_dir}".`);
  }
}

export async function installAddin(application: Application) {
  const addin = addins[application];
  const filename = basename(addin);
  const path = join(addins_dir, filename);

  await remove(path);
  await symlink(addin, path, 'file');

  if (env.isWindows) {
    await addToOPEN(application, filename);
    await enableVBOM(application);
  } else {
    // TODO
  }
}

export async function uninstallAddin(application: Application) {
  const addin = addins[application];
  const filename = basename(addin);
  const path = join(addins_dir, filename);

  if (env.isWindows) {
    await removeFromOPEN(application, filename);
  } else {
    // TODO
  }

  await remove(path);
}
