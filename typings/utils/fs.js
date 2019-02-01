import { promisify } from 'util';
import { readFile as _readFile, symlink as _symlink, writeFile as _writeFile } from 'fs';
import { copy } from 'fs-extra/lib/copy';
import { emptyDir } from 'fs-extra/lib/empty';
import { ensureDir, ensureDirSync } from 'fs-extra/lib/mkdirs';
import { move } from 'fs-extra/lib/move';
import { pathExists } from 'fs-extra/lib/path-exists';
import { readJson } from 'fs-extra/lib/json/jsonfile';
import { remove } from 'fs-extra/lib/remove';
const readFile = promisify(_readFile);
const symlink = promisify(_symlink);
const writeFile = promisify(_writeFile);
import hash from './hash';
async function checksum(file, algorithm = 'sha256') {
    const data = await readFile(file);
    return hash(data, { algorithm });
}
async function tmpFile(options = {}) {
    const { dir, prefix = 'vba-blocks-', template } = options;
    return new Promise((resolve, reject) => {
        // Defer requiring tmp as it adds process listeners that can cause warnings
        require('tmp').file({ prefix, dir, template }, (err, path) => {
            if (err)
                return reject(err);
            resolve(path);
        });
    });
}
async function tmpFolder(options = {}) {
    const { dir, prefix = 'vba-blocks-', template } = options;
    return new Promise((resolve, reject) => {
        require('tmp').dir({ prefix, dir, template }, (err, path) => {
            if (err)
                return reject(err);
            resolve(path);
        });
    });
}
// (for mocking only)
function reset() { }
export { checksum, copy, emptyDir, ensureDir, ensureDirSync, move, pathExists, readFile, readJson, remove, reset, symlink, tmpFile, tmpFolder, writeFile };
