import { join, dirname, basename } from 'path';
import { extract } from 'tar';
import env from '../env';
import {
  download,
  checksum as getChecksum,
  has,
  isString,
  tmpFile
} from '../utils';
import { ensureDir, pathExists, move, readFile } from '../utils/fs';
import { clone, pull } from '../utils/git';
import { Feature, Version } from '../manifest';
import { RegistryDependency } from '../manifest/dependency';
import {
  Registration,
  getRegistrationId,
  getRegistrationSource
} from './registration';
import { Source } from './source';

export interface RegistryOptions {
  name: string;
  index: string;
  packages: string;
}

export default class RegistrySource implements Source {
  name: string;
  local: { index: string; packages: string };
  remote: { index: string; packages: string };
  sources: string;
  pulling: Promise<void>;

  constructor({ name, index, packages }: RegistryOptions) {
    this.name = name;
    this.local = {
      index: join(env.registry, name),
      packages: join(env.packages, name)
    };
    this.remote = { index, packages };
    this.sources = join(env.sources, name);

    this.pulling = pullIndex(this.local.index, this.remote.index);
  }

  async resolve(dependency: RegistryDependency): Promise<Registration[]> {
    const { name } = dependency;
    const path = getPath(this.local.index, name);

    await this.pulling;
    if (!await pathExists(path)) {
      throw new Error(`"${name}" was not found in the registry`);
    }

    const data = await readFile(path, 'utf8');
    const registrations: Registration[] = data
      .split(/\r?\n/)
      .map((line: string) => JSON.parse(line))
      .filter((value: any) => value && !value.yanked)
      .map(parseRegistration);

    return registrations;
  }

  async fetch(registration: Registration): Promise<string> {
    const url = getPackage(this.remote.packages, registration);
    const file = getPackage(this.local.packages, registration);

    const [_, checksum] = registration.source.split('#', 2);

    if (!await pathExists(file)) {
      const unverifiedFile = await tmpFile();
      await download(url, unverifiedFile);

      const comparison = await getChecksum(unverifiedFile);
      if (comparison !== checksum) {
        throw new Error(`Invalid checksum for ${registration.id}`);
      }

      await move(unverifiedFile, file);
    }

    const src = getSource(this.sources, registration);
    await ensureDir(src);
    await extract({ file, cwd: src });

    return src;
  }
}

export async function pullIndex(local: string, remote: string) {
  if (!await pathExists(local)) {
    const dir = dirname(local);
    await ensureDir(dir);
    await clone(remote, basename(local), dir);
  }

  await pull(local);
}

export function parseRegistration(registry: string, value: any): Registration {
  const { name, vers: version, cksum: checksum } = value;

  const dependencies: RegistryDependency[] = value.deps.map((dep: any) => {
    const { name, req, features, optional, defaultFeatures } = dep;
    const dependency: RegistryDependency = {
      name,
      registry,
      version: req,
      features,
      optional,
      defaultFeatures
    };

    return dependency;
  });

  return {
    id: getRegistrationId(name, version),
    source: getRegistrationSource('registry', name, checksum),
    name,
    version,
    dependencies
  };
}

function getPath(index: string, name: string): string {
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

  return join(index, ...parts, name);
}

function getPackage(packages: string, registration: Registration): string {
  const { name, version } = registration;
  return join(packages, name, `v${version}.block`);
}

function getSource(sources: string, registration: Registration): string {
  const { name, version } = registration;
  const file = `v${version}`.replace(/\./g, '-');
  return join(sources, name, file);
}
