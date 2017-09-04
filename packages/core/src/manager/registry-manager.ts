import { join, dirname, basename } from 'path';
import { createInterface as readline } from 'readline';
import { createReadStream, ensureDir, exists } from 'fs-extra';
import { extract } from 'tar';
import { download, checksum as getChecksum } from '../utils';
import { clone, pull } from '../utils/git';
import { Config } from '../config';
import { RegistryDependency } from '../manifest/dependency';
import { Registration } from './registration';

export async function update(config: Config) {
  const { local, remote } = config.registry;

  if (!await exists(local)) {
    const dir = dirname(local);
    await ensureDir(dir);
    await clone(remote, basename(local), dir);
  }

  await pull(local);
}

export async function resolve(
  config: Config,
  dependency: RegistryDependency
): Promise<Registration[]> {
  const { name } = dependency;

  return new Promise<Registration[]>((resolve, reject) => {
    const path = getPath(config, name);
    const registrations: Registration[] = [];

    const input = createReadStream(path);
    const reader = readline({ input });

    reader.on('line', line => {
      const { name, vers, deps, cksum, features, yanked } = JSON.parse(line);
      if (yanked) return;

      const dependencies: RegistryDependency[] = deps.map(dep => {
        const { name, req, features, optional, default_features } = dep;
        const dependency: RegistryDependency = {
          name,
          version: req,
          features,
          optional,
          default_features
        };

        return dependency;
      });

      registrations.push({
        name,
        version: vers,
        dependencies,
        features,
        checksum: cksum,
        source: `registry+${config.registry.remote}`
      });
    });
    reader.on('close', () => resolve(registrations));
    reader.on('error', reject);
  });
}

export async function fetch(config: Config, registration: Registration) {
  const url = config.resolveRemotePackage(registration);
  const file = config.resolveLocalPackage(registration);

  if (!await exists(file)) {
    await download(url, file);

    if (registration.checksum && registration.checksum !== '<none>') {
      const checksum = await getChecksum(file);
      if (checksum !== registration.checksum) {
        // TODO error and continue / delete downloaded
      }
    }
  }

  const src = config.resolveSource(registration);

  await ensureDir(src);
  await extract({ file, cwd: src });
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
