import { promisify } from 'util';
import { copyFile } from 'fs';

const copy = copyFile ? promisify(copyFile) : require('fs-extra').copy;
export default copy;
