import { join, dirname, basename } from 'path';
import * as readline from 'readline';
import { createReadStream, ensureDir, exists } from 'fs-extra';
import { clone, pull } from './utils/git';
import { Config } from './config';

export interface DependencyInfo {
  name: string;
  req: string;
  features: string[];
  optional: boolean;
  default_features: boolean;
}

export interface PackageInfo {
  name: string;
  vers: string;
  deps: DependencyInfo[];
  cksum: string;
  features: { [name: string]: string[] };
  yanked?: boolean;
}

export async function getVersions(
  config: Config,
  name: string
): Promise<PackageInfo[]> {
  return new Promise<PackageInfo[]>((resolve, reject) => {
    const path = getPath(config, name);
    const versions: PackageInfo[] = [];

    const reader = readline.createInterface({
      input: createReadStream(path)
    });
    reader.on('line', line => versions.push(JSON.parse(line)));
    reader.on('close', () => resolve(versions));
    reader.on('error', reject);
  });
}

export async function updateRegistry(config: Config): Promise<void> {
  const { local, remote } = config.registry;

  if (!await exists(local)) {
    const dir = dirname(local);
    await ensureDir(dir);
    await clone(remote, basename(local), dir);
  }

  await pull(local);
}

export function getPath(config: Config, name: string): string {
  let parts;
  if (name.length === 1) {
    parts = [1, name];
  } else if (name.length === 2) {
    parts = [2, name];
  } else if (name.length === 3) {
    parts = [3, name.substring(0, 1)];
  } else {
    parts = [name.substring(0, 2), name.substring(2, 4)];
  }

  return join(config.registry.local, ...parts, name);
}
