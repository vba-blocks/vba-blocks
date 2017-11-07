import { promisify } from 'util';
import { copyFile } from 'fs';
import {
  pathExists,
  readFile,
  writeFile,
  ensureDir,
  move,
  remove
} from 'fs-extra';

const copy = copyFile ? promisify(copyFile) : require('fs-extra').copy;

export {
  pathExists,
  ensureDir,
  readFile,
  writeFile,
  copy as copyFile,
  move,
  remove
};
