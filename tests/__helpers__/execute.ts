import { promisify } from 'util';
import { copy, remove, ensureDirSync, readFile } from 'fs-extra';
import walkSync from 'walk-sync';
import { join, resolve, extname, basename } from '../../src/utils/path';
import { tmpFolder } from '../../src/utils/fs';
import { RunResult } from '../../src/utils/run';
import { truncate } from '../../src/utils/text';
const exec = promisify(require('child_process').exec);

import { run as _run } from '../../';

export { RunResult };

const tmp_dir = join(__dirname, '../.tmp');
ensureDirSync(tmp_dir);

export async function tmp(id: string, action: (cwd: string) => void) {
  const path = await tmpFolder({ dir: tmp_dir, prefix: `${id}-` });

  try {
    await action(path);
  } finally {
    await remove(path);
  }
}

export async function setup(
  dir: string,
  id: string,
  action: (cwd: string) => void
): Promise<void> {
  await tmp(id, async path => {
    await copy(dir, path);
    await action(path);
  });
}

export async function execute(
  cwd: string,
  command: string
): Promise<{ stdout: string; stderr: string }> {
  const bin = resolve(__dirname, '../../dist/bin/vba-blocks');
  const result = await exec(`${bin} ${command}`, { cwd });

  // Give Office time to clean up
  await wait();

  return result;
}

const isBackup = /\.backup/;
const isGit = /\.git[\/,\\]/;
const isBinary = (file: string) => ['.xlsm', '.frx'].includes(extname(file));

export async function readdir(
  cwd: string
): Promise<{ [path: string]: string }> {
  const files = walkSync(cwd, { directories: false });
  const details: { [file: string]: string } = {};
  const checking = files.map(async file => {
    if (isBackup.test(file) || isGit.test(file)) return;

    // TEMP Need reproducible builds to compare binary results
    if (isBinary(file)) {
      details[file] = '<TODO>';
    } else {
      const data = await readFile(resolve(cwd, file), 'utf8');
      details[file] =
        basename(file) === 'vba-block.toml'
          ? data
          : truncate(normalize(data), 200);
    }
  });
  await Promise.all(checking);

  return details;
}

export async function run(
  application: string,
  file: string,
  macro: string,
  arg: string
): Promise<RunResult> {
  let result;
  try {
    result = await _run(application, file, macro, arg);

    // Give Office time to clean up
    await wait();
  } catch (err) {
    result = err.result;
  }

  return result;
}

async function wait(ms = 500) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), ms);
  });
}

function normalize(value: string): string {
  return value
    .replace(/\r/g, '{CR}')
    .replace(/\n/g, '{LF}')
    .replace(/\t/g, '{tab}');
}
