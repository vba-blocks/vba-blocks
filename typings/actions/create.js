import env from '../env';
import { join } from '../utils/path';
import { pathExists, ensureDir } from '../utils/fs';
import init from './init';
import { newNameRequired, newDirExists, newTargetRequired } from '../errors';
export default async function create(options) {
    if (!options || !options.name) {
        throw newNameRequired();
    }
    let { name, target, from, pkg, git } = options;
    // Load target from extension (if given)
    if (!target && !from && name.includes('.')) {
        const parts = name.split('.');
        target = parts.pop();
        name = parts.join('.');
    }
    if (!pkg && !target && !from) {
        throw newTargetRequired();
    }
    const dir = join(env.cwd, name);
    if (await pathExists(dir)) {
        throw newDirExists(name, dir);
    }
    await ensureDir(dir);
    await init({ name, dir, target, from, pkg, git });
}
