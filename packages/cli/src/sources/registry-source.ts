import { promisify } from 'util';
import { join, dirname, basename } from 'path';
import { createReadStream, ensureDir, exists, move, readFile } from 'fs-extra';
import { extract } from 'tar';
import * as tmp from 'tmp';
import { download, checksum as getChecksum } from '../utils';
import { clone, pull } from '../utils/git';
import { Config } from '../config';
import { Feature } from '../manifest';
import { RegistryDependency } from '../manifest/dependency';
import {
  Registration,
  getRegistrationId,
  getRegistrationSource
} from './registration';

const tmpFile = promisify(tmp.file);

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
  const path = getPath(config, name);

  if (!await exists(path)) {
    throw new Error(`"${name}" was not found in the registry`);
  }

  const data = await readFile(path);
  const registrations: Registration[] = data
    .split(/\r?\n/)
    .map(line => JSON.parse(line))
    .filter(value => value && !value.yanked)
    .map(parseRegistration);

  return registrations;
}

export async function fetch(config: Config, registration: Registration) {
  const url = config.resolveRemotePackage(registration);
  const file = config.resolveLocalPackage(registration);

  const [_, checksum] = registration.source.split('#', 2);

  if (!await exists(file)) {
    const unverifiedFile = await tmpFile();
    await download(url, unverifiedFile);

    const comparison = await getChecksum(unverifiedFile);
    if (comparison !== checksum) {
      throw new Error(`Invalid checksum for ${registration.id}`);
    }

    await move(unverifiedFile, file);
  }

  const src = config.resolveSource(registration);

  await ensureDir(src);
  await extract({ file, cwd: src });

  return src;
}

export function parseRegistration(value: any): Registration {
  const { name, vers: version, cksum: checksum } = value;

  const dependencies: RegistryDependency[] = value.deps.map(dep => {
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

  const features: Feature[] = [];
  for (const [name, dependencies] of Object.entries(value.features)) {
    features.push({ name, dependencies, src: [], references: [] });
  }

  return {
    id: getRegistrationId(name, version),
    source: getRegistrationSource(
      'registry',
      'https://github.com/vba-blocks/registry',
      checksum
    ),
    name,
    version,
    dependencies,
    features
  };
}

export function getPath(config: Config, name: string): string {
  let parts;
  if (name.length === 1) {
    parts = ['1', name];
  } else if (name.length === 2) {
    parts = ['2', name];
  } else if (name.length === 3) {
    parts = ['3', name.substring(0, 1)];
  } else {
    parts = [name.substring(0, 2), name.substring(2, 4)];
  }

  return join(config.registry.local, ...parts, name);
}
