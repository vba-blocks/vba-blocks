import { join } from './path';
import * as fs from 'fs';
import * as git from 'isomorphic-git';

const debug = require('debug')('vba-blocks:git');

git.plugins.set('fs', fs);

export async function clone(remote: string, name: string, cwd: string) {
  const dir = join(cwd, name);

  debug(`clone: ${remote} to ${dir}`);
  await git.clone({ dir, url: remote, depth: 1 });
}

export async function pull(local: string) {
  debug(`pull: ${local}`);
  await git.pull({ dir: local });
}

export async function init(dir: string) {
  debug(`init: ${dir}`);
  await git.init({ dir });
}
