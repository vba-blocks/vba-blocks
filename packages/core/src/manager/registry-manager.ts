import { join, dirname, basename } from 'path';
import { createInterface as readline } from 'readline';
import { createReadStream, ensureDir, exists } from 'fs-extra';
import { extract } from 'tar';
import { download } from '../utils';
import { clone, pull } from '../utils/git';
import { Config } from '../config';
import { RegistryDependency } from '../manifest/dependency';
import { Manager } from './manager';
import { Registration } from './registration';

const registry: Manager = {
  async prepare(config) {
    const { local, remote } = config.registry;

    if (!await exists(local)) {
      const dir = dirname(local);
      await ensureDir(dir);
      await clone(remote, basename(local), dir);
    }

    await pull(local);
  },

  async resolve(
    config,
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

        const dependencies = deps.map(dependency => {
          const {
            name,
            req,
            features,
            optional,
            default_features
          } = dependency;
          return { name, range: req, features, optional, default_features };
        });

        registrations.push({
          name,
          version: vers,
          dependencies,
          features,
          checksum: cksum
        });
      });
      reader.on('close', () => resolve(registrations));
      reader.on('error', reject);
    });
  },

  async fetch(config, registration) {
    const url = config.resolveRemotePackage(registration);
    const file = config.resolveLocalPackage(registration);

    if (!await exists(file)) {
      await download(url, file);
    }

    const src = config.resolveSource(registration);

    await ensureDir(src);
    await extract({ file, cwd: src });
  }
};
export default registry;

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
