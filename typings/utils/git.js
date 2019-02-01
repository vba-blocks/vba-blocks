import { join } from './path';
import * as fs from 'fs';
const debug = require('debug')('vba-blocks:git');
async function loadGit() {
    const git = await import('isomorphic-git');
    git.plugins.set('fs', fs);
    return git;
}
export async function clone(remote, name, cwd) {
    const git = await loadGit();
    const dir = join(cwd, name);
    debug(`clone: ${remote} to ${dir}`);
    await git.clone({ dir, url: remote, depth: 1 });
}
export async function pull(local) {
    const git = await loadGit();
    debug(`pull: ${local}`);
    await git.pull({ dir: local });
}
export async function init(dir) {
    const git = await loadGit();
    debug(`init: ${dir}`);
    await git.init({ dir });
}
