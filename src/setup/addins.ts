import { homedir } from 'os';
import { Application, addins } from '../addin';
import exec from './exec';
import { CliError } from '../errors';
import env from '../env';
import { BY_LINE } from '../utils/text';
import { join, basename } from '../utils/path';
import { pathExists, remove, symlink } from '../utils/fs';

export async function installAddin(application: Application) {
  if (env.isWindows && (await check(`${application}.exe`))) {
    throw new Error(
      `${application} must be closed for the vba-blocks add-in to be installed correctly.`
    );
  }

  // 1. Create symlink in Office add-ins directory
  const addins_dir = env.isWindows
    ? join(homedir(), 'AppData', 'Roaming', 'Microsoft', 'Addins')
    : 'TODO';
  if (!(await pathExists(addins_dir))) {
    throw new Error(`Add-in directory not found at "${addins_dir}"`);
  }

  const addin = addins[application];
  const filename = basename(addin);
  const path = join(addins_dir, filename);

  await remove(path);
  await symlink(addin, path, 'file');

  if (env.isWindows) {
    await addToOPEN(application, filename);
    await enableVBOM(application);
  }
}

export async function uninstallAddin(application: Application) {
  // TODO
}

export async function addToOPEN(application: Application, filename: string) {
  try {
    await exec(['add-to-open', application, filename]);
  } catch (underlying) {
    throw new CliError(
      `Failed to add ${filename} to add-ins for ${application}.`,
      { underlying }
    );
  }
}

export async function removeFromOPEN(
  application: Application,
  filename: string
) {
  try {
    await exec(['remove-from-open', application, filename]);
  } catch (underlying) {
    throw new CliError(
      `Failed to remove ${filename} from add-ins for ${application}.`,
      { underlying }
    );
  }
}

export async function enableVBOM(application: Application) {
  try {
    await exec(['enable-vbom', application]);
  } catch (underlying) {
    throw new CliError(
      'Failed to enable access to the VBA project object model.',
      { underlying }
    );
  }
}

export async function check(name: string): Promise<boolean> {
  try {
    const match = new RegExp(name, 'i');
    const { stdout } = await exec(['get-processes']);
    const processes = stdout.split(BY_LINE).filter(Boolean);

    return processes.some(name => match.test(name));
  } catch (_) {
    // (ignore)
    return false;
  }
}
