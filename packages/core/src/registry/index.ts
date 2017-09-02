import { join, dirname, basename } from 'path';
import * as readline from 'readline';
import { createReadStream, ensureDir, exists } from 'fs-extra';
import { clone, pull } from '../utils/git';
import { Config } from '../config';
import { Version, Dependency } from '../manifest';

export interface Registration {
  name: string;
  version: Version;
  dependencies: Dependency[];
  features: { [name: string]: string[] };
  checksum?: string;
  yanked?: boolean;
}

export async function getRegistered(
  config: Config,
  name: string
): Promise<Registration[]> {
  return new Promise<Registration[]>((resolve, reject) => {
    const path = getPath(config, name);
    const registrations: Registration[] = [];

    const reader = readline.createInterface({
      input: createReadStream(path)
    });
    reader.on('line', line => {
      const { name, vers, deps, cksum, features, yanked } = JSON.parse(line);
      const dependencies = deps.map(dependency => {
        const { name, req, features, optional, default_features } = dependency;
        return { name, range: req, features, optional, default_features };
      });

      registrations.push({
        name,
        version: vers,
        dependencies,
        features,
        checksum: cksum,
        yanked
      });
    });
    reader.on('close', () => resolve(registrations));
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
