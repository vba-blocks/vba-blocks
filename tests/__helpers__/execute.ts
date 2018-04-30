import { promisify } from 'util';
import { resolve } from 'path';
import { copy, remove } from 'fs-extra';
import walkSync from 'walk-sync';
import { checksum, tmpFolder } from '@vba-blocks/src/utils';

const exec = promisify(require('child_process').exec);
const isBackup = /\.backup/g;
const isBinary = /\.xlsm/g;

export async function tmp(dir) {
  const path = await tmpFolder();
  await copy(dir, path);

  return { path, cleanup: () => remove(path) };
}

export async function execute(cwd, command) {
  const bin = resolve(__dirname, '../../lib/bin/vba-blocks');
  const { stdout, stderr } = await exec(`node ${bin} ${command}`, { cwd });

  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
}

export async function check(dir) {
  const files = walkSync(dir, { directories: false });
  const details = {};
  const checking = files.map(async file => {
    if (isBackup.test(file)) return;

    // TEMP Need reproducible builds to compare binary results
    if (isBinary.test(file)) {
      details[file] = '<TODO>';
    } else {
      details[file] = await checksum(resolve(dir, file));
    }
  });
  await Promise.all(checking);

  return {
    __result: true,
    details
  };
}
