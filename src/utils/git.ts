import { join } from './path';
import * as fs from 'fs';
import env from '../env';

const debug = env.debug('vba-blocks:git');

interface Git {
  clone(options: { dir: string; url: string; depth?: number }): Promise<void>;
  pull(options: { dir: string }): Promise<void>;
  init(options: { dir: string }): Promise<void>;
}

async function loadGit(): Promise<Git> {
  const fetch = await import('node-fetch');
  (global as any).fetch = fetch.default;

  const git = await import('isomorphic-git');
  git.plugins.set('fs', fs);

  return git;
}

export async function clone(remote: string, name: string, cwd: string) {
  const git = await loadGit();
  const dir = join(cwd, name);

  debug(`clone: ${remote} to ${dir}`);
  await git.clone({ dir, url: remote, depth: 1 });
}

export async function pull(local: string) {
  const git = await loadGit();

  debug(`pull: ${local}`);
  await git.pull({ dir: local });
}

export async function init(dir: string) {
  const git = await loadGit();

  debug(`init: ${dir}`);
  await git.init({ dir });
}
