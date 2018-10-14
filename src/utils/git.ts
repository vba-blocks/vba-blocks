import { join } from './path';
import * as fs from 'fs';
import * as git from 'isomorphic-git';

git.plugins.set('fs', fs);

export async function clone(remote: string, name: string, cwd: string) {
  const dir = join(cwd, name);
  await git.clone({ dir, url: remote, depth: 1 });
}

export async function pull(local: string) {
  await git.pull({ dir: local });
}

export async function init(dir: string) {
  await git.init({ dir });
}
