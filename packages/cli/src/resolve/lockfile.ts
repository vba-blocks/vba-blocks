import { join } from 'path';
import { exists, readFile, writeFile } from 'fs-extra';
import { parse as parseToml } from 'toml';
import { Config } from '../config';
import { Manifest } from '../manifest';
import { convertToToml } from '../utils';
import { DependencyGraph } from './dependency-graph';

export interface Lockfile {
  manifest: {};
  graph: DependencyGraph;
}

export async function readLockfile(config: Config): Promise<Lockfile | null> {
  const file = join(config.cwd, 'vba-block.lock');
  if (!await exists(file)) return null;

  const toml = await readFile(file);
  const lockfile = fromToml(toml);

  return lockfile;
}

export async function writeLockfile(
  config: Config,
  lockfile: Lockfile
): Promise<void> {
  const file = join(config.cwd, 'vba-block.lock');
  const toml = toToml(lockfile);

  return writeFile(file, toml);
}

export function toToml(lockfile: Lockfile): string {
  return convertToToml({ root: {}, package: [] });
}

export function fromToml(toml: string): Lockfile {
  const parsed = parseToml(toml);

  // TODO
  return { manifest: {}, graph: [] };
}
