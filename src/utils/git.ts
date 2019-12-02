import * as fs from 'fs';
import env from '../env';
import { pathExists } from './fs';
import * as localGit from './local-git';
import { join } from './path';

const debug = env.debug('vba-blocks:git');

export interface Git {
  clone(options: { dir: string; url: string; depth?: number }): Promise<void>;
  pull(options: { dir: string }): Promise<void>;
  init(options: { dir: string }): Promise<void>;
}

async function loadGit(): Promise<Git> {
  if (await localGit.isAvailable()) return localGit;

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

export async function addAll(dir: string) {
  if (!localGit.isAvailable() || !isGitRepository(dir)) return;
  localGit.addAll({ dir });
}

export async function commit(dir: string, message: string) {
  if (!localGit.isAvailable() || !isGitRepository(dir)) return;
  localGit.commit({ dir, message });
}

export async function tag(dir: string, ref: string, sign: boolean) {
  if (!localGit.isAvailable() || !isGitRepository(dir)) return;
  localGit.tag({ dir, ref, sign });
}

export async function isGitRepository(dir: string): Promise<boolean> {
  return await pathExists(join(dir, '.git'));
}
