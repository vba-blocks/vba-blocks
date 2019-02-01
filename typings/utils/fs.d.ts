/// <reference types="node" />
import { readFile as _readFile, symlink as _symlink, writeFile as _writeFile } from 'fs';
import { copy } from 'fs-extra/lib/copy';
import { emptyDir } from 'fs-extra/lib/empty';
import { ensureDir, ensureDirSync } from 'fs-extra/lib/mkdirs';
import { move } from 'fs-extra/lib/move';
import { pathExists } from 'fs-extra/lib/path-exists';
import { readJson } from 'fs-extra/lib/json/jsonfile';
import { remove } from 'fs-extra/lib/remove';
declare const readFile: typeof _readFile.__promisify__;
declare const symlink: typeof _symlink.__promisify__;
declare const writeFile: typeof _writeFile.__promisify__;
declare function checksum(file: string, algorithm?: string): Promise<string>;
export interface TmpOptions {
    dir?: string;
    prefix?: string;
    template?: string;
}
declare function tmpFile(options?: TmpOptions): Promise<string>;
declare function tmpFolder(options?: TmpOptions): Promise<string>;
declare function reset(): void;
export { checksum, copy, emptyDir, ensureDir, ensureDirSync, move, pathExists, readFile, readJson, remove, reset, symlink, tmpFile, tmpFolder, writeFile };
