import {
  copy,
  emptyDir,
  ensureDir,
  ensureDirSync,
  move,
  pathExists,
  readFile,
  readJson,
  remove,
  symlink,
  writeFile
} from 'fs-extra';

import hash from './hash';

async function checksum(file: string, algorithm = 'sha256'): Promise<string> {
  const data = await readFile(file);
  return hash(data, { algorithm });
}

export interface TmpOptions {
  dir?: string;
  prefix?: string;
  template?: string;
}

async function tmpFile(options: TmpOptions = {}): Promise<string> {
  const { dir, prefix = 'vba-blocks-', template } = options;

  return new Promise<string>((resolve, reject) => {
    // Defer requiring tmp as it adds process listeners that can cause warnings
    require('tmp').file({ prefix, dir, template }, (err: any, path: string) => {
      if (err) return reject(err);
      resolve(path);
    });
  });
}

async function tmpFolder(options: TmpOptions = {}): Promise<string> {
  const { dir, prefix = 'vba-blocks-', template } = options;

  return new Promise<string>((resolve, reject) => {
    require('tmp').dir({ prefix, dir, template }, (err: any, path: string) => {
      if (err) return reject(err);
      resolve(path);
    });
  });
}

// (for mocking only)
function reset() {}

export {
  checksum,
  copy,
  emptyDir,
  ensureDir,
  ensureDirSync,
  move,
  pathExists,
  readFile,
  readJson,
  remove,
  reset,
  symlink,
  tmpFile,
  tmpFolder,
  writeFile
};
