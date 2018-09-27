import env from '../env';
import { join } from '../utils/path';
import { pathExists, ensureDir } from '../utils/fs';
import init from './init';
import { newNameRequired, newDirExists } from '../errors';

export interface CreateOptions {
  name: string;
  target?: string;
  from?: string;
  pkg: boolean;
  git: boolean;
}

export default async function create(options: CreateOptions) {
  if (!options || !options.name) {
    throw newNameRequired();
  }

  let { name, target, from, pkg, git } = options;
  const dir = join(env.cwd, name);

  if (await pathExists(dir)) {
    throw newDirExists(name, dir);
  }

  await ensureDir(dir);
  await init({ name, dir, target, from, pkg, git });
}
