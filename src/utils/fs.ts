import { promisify } from 'util';
import { copyFile } from 'fs';
import { createHash } from 'crypto';
import {
  pathExists,
  readFile,
  writeFile,
  ensureDir,
  ensureDirSync,
  emptyDir,
  move,
  remove
} from 'fs-extra';
import sanitizeFilename from 'sanitize-filename';
import hash from './hash';

async function checksum(file: string, algorithm = 'sha256'): Promise<string> {
  const data = await readFile(file);
  return hash(data);
}

// Use built-in node copyFile, if available
const copy: (src: string, dest: string) => Promise<void> = copyFile
  ? promisify(copyFile)
  : require('fs-extra').copy;

export interface TmpOptions {
  dir?: string;
}

async function tmpFile(options: TmpOptions = {}): Promise<string> {
  const { dir } = options;

  return new Promise<string>((resolve, reject) => {
    // Defer requiring tmp as it adds process listeners that can cause warnings
    require('tmp').file(
      { prefix: 'vba-blocks-', dir },
      (err: any, path: string) => {
        if (err) return reject(err);
        resolve(path);
      }
    );
  });
}

async function tmpFolder(options: TmpOptions = {}): Promise<string> {
  const { dir } = options;

  return new Promise<string>((resolve, reject) => {
    require('tmp').dir(
      { prefix: 'vba-blocks-', dir },
      (err: any, path: string) => {
        if (err) return reject(err);
        resolve(path);
      }
    );
  });
}

async function readJson(path: string): Promise<any> {
  const raw = await readFile(path);
  return JSON.parse(raw.toString());
}

function sanitize(name: string): string {
  return sanitizeFilename(name, { replacement: '-' });
}

export {
  checksum,
  copy as copyFile,
  ensureDir,
  ensureDirSync,
  emptyDir,
  move,
  pathExists,
  readFile,
  readJson,
  remove,
  sanitize,
  tmpFile,
  tmpFolder,
  writeFile
};
