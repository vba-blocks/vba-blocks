import { promisify } from 'util';
import { join, resolve } from 'path';
import { copy, remove, ensureDirSync } from 'fs-extra';
import walkSync from 'walk-sync';
import { checksum, tmpFolder } from '../../src/utils';
const exec = promisify(require('child_process').exec);

export { run } from '../../';

const tmp_dir = join(__dirname, '../.tmp');
ensureDirSync(tmp_dir);

export async function setup(
  dir: string,
  id: string,
  action: (cwd: string) => void
): Promise<void> {
  const path = await tmpFolder({ dir: tmp_dir, prefix: `${id}-` });
  await copy(dir, path);

  try {
    await action(path);
  } finally {
    // await remove(path);
  }
}

export async function execute(cwd: string, command: string) {
  const bin = resolve(__dirname, '../../dist/bin/vba-blocks');
  const { stdout, stderr } = await exec(`${bin} ${command}`, { cwd });

  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
}

const isBackup = /\.backup/g;
const isBinary = /\.xlsm/g;

export async function readdir(
  cwd: string
): Promise<{ [path: string]: string }> {
  const files = walkSync(cwd, { directories: false });
  const details = {};
  const checking = files.map(async file => {
    if (isBackup.test(file)) return;

    // TEMP Need reproducible builds to compare binary results
    if (isBinary.test(file)) {
      details[file] = '<TODO>';
    } else {
      details[file] = await checksum(resolve(cwd, file));
    }
  });
  await Promise.all(checking);

  return details;
}
