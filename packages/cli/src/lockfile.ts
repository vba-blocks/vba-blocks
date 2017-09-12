import { join } from 'path';
import { pathExists, readFile, writeFile } from 'fs-extra';
import { parse as parseToml } from 'toml';
import { Config } from './config';
import { Manifest } from './manifest';
import { convertToToml } from './utils';
import { DependencyGraph } from './resolve';

export interface Lockfile {
  manifest: {};
  resolved: DependencyGraph;
}

export async function readLockfile(config: Config): Promise<Lockfile | null> {
  const file = getLockfilePath(config);
  if (!await pathExists(file)) return null;

  const toml = await readFile(file, 'utf8');
  const lockfile = fromToml(toml);

  return lockfile;
}

export async function writeLockfile(
  config: Config,
  lockfile: Lockfile
): Promise<void> {
  const file = getLockfilePath(config);
  const toml = toToml(lockfile);

  return writeFile(file, toml);
}

export function isLockfileValid(lockfile: Lockfile, manifest: Manifest) {
  // TODO
  return false;
}

export function toToml(lockfile: Lockfile): string {
  return convertToToml({ root: {}, package: [] });
}

export function fromToml(toml: string): Lockfile {
  const parsed = parseToml(toml);

  // TODO
  return { manifest: {}, resolved: [] };
}

export function getLockfilePath(config: Config): string {
  return join(config.cwd, 'vba-block.lock');
}
