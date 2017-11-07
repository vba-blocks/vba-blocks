import { promisify } from 'util';
import { copyFile } from 'fs';
import { createHash } from 'crypto';
import {
  pathExists,
  readFile,
  writeFile,
  ensureDir,
  move,
  remove
} from 'fs-extra';

async function checksum(file: string, algorithm = 'sha256'): Promise<string> {
  const hash = createHash(algorithm);
  const data = await readFile(file);

  hash.update(data, 'utf8');
  return hash.digest('hex');
}

// Use built-in node copyFile, if available
const copy = copyFile ? promisify(copyFile) : require('fs-extra').copy;

async function tmpFile(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    // Defer requiring tmp as it adds process listeners that can cause warnings
    require('tmp').file((err: any, path: string) => {
      if (err) return reject(err);
      resolve(path);
    });
  });
}

export {
  checksum,
  copy as copyFile,
  ensureDir,
  move,
  pathExists,
  readFile,
  remove,
  tmpFile,
  writeFile
};
