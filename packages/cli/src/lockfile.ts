import { join } from 'path';
import { pathExists, readFile, writeFile } from 'fs-extra';
import { parse as parseToml } from 'toml';
import env from './env';
import { Config } from './config';
import { Manifest } from './manifest';
import { Workspace } from './workspace';
import { DependencyGraph } from './resolve';
import { convertToToml } from './utils';

export interface Lockfile {
  manifest?: Manifest;
  workspace: Workspace;
  packages: DependencyGraph;
}

export async function readLockfile(dir: string): Promise<Lockfile | null> {
  const file = getLockfilePath(dir);
  if (!await pathExists(file)) return null;

  const toml = await readFile(file, 'utf8');
  const lockfile = fromToml(toml);

  return lockfile;
}

export async function writeLockfile(
  dir: string,
  lockfile: Lockfile
): Promise<void> {
  const file = getLockfilePath(dir);
  const toml = toToml(lockfile);

  return writeFile(file, toml);
}

export function isLockfileValid(lockfile: Lockfile, workspace: Workspace) {
  // TODO
  return false;
}

export function toToml(lockfile: Lockfile): string {
  return convertToToml({ root: {}, package: [] });
}

export function fromToml(toml: string): Lockfile {
  const parsed = parseToml(toml);

  // TODO
  return { workspace: { root: null, members: [] }, packages: [] };
}

export function getLockfilePath(dir: string): string {
  return join(dir, 'vba-block.lock');
}
