import { promisify } from 'util';
import { readFileSync, writeFileSync } from 'fs-extra';
const { copyFile } = require('fs');

const copy = copyFile
  ? promisify(copyFile)
  : async (src: string, dest: string) => {
      writeFileSync(readFileSync(src), dest);
    };
export default copy;
