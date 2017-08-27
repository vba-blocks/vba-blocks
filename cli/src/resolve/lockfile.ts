import { join } from 'path';
import { exists, readFile, writeFile } from 'fs-extra';
import * as toml from 'toml';
import { Config } from '../config';
import { Version } from '../version';
import { convertToToml } from '../utils';

export interface PackageReference {
  name: string;
  version?: Version;
  source?: string;
  dependencies?: string[];
}

export interface Lockfile {
  root: PackageReference;
  packages: PackageReference[];
  metadata: any;
}

export async function loadLockfile(config: Config): Promise<Lockfile | null> {
  const file = join(config.cwd, 'vba-block.lock');
  if (!await exists(file)) return null;

  const raw = await readFile(file);
  const lockfile = toml.parse(raw);

  return lockfile;
}

export async function writeLockfile(config: Config, lockfile: Lockfile) {
  const file = join(config.cwd, 'vba-block.lock');
  const converted = convertToToml(lockfile);
  await writeFile(file, converted);
}
