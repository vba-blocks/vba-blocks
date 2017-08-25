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

export interface ManifestInfo {
  name: string;
  vers: string;
  deps: DependencyInfo[];
  cksum: string;
  features: { [name: string]: string[] };
  yanked?: boolean;
}

export async function getVersions(config: Config, name: string) {
  return new Promise<ManifestInfo[]>((resolve, reject) => {
    const path = getPath(config, name);
    const versions: ManifestInfo[] = [];

    const reader = readline.createInterface({
      input: createReadStream(path)
    });
    reader.on('line', line => versions.push(JSON.parse(line)));
    reader.on('close', () => resolve(versions));
    reader.on('error', reject);
  });
}

export async function updateRegistry(config: Config) {
  if (!await exists(config.registry.local)) {
    const dir = dirname(config.registry.local);
    await ensureDir(dir);
    await clone(config.registry.remote, basename(config.registry.local), dir);
  }

  await pull(config.registry.local);
}

export function getPath(config: Config, name: string) {
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
