import { dirname, basename } from 'path';
import { extract } from 'tar';
import env from '../env';
import { download, has, isString, unixJoin } from '../utils';
import {
  checksum as getChecksum,
  ensureDir,
  pathExists,
  move,
  readFile,
  tmpFile
} from '../utils/fs';
import { clone, pull } from '../utils/git';
import { Version } from '../manifest';
import { Dependency, RegistryDependency } from '../manifest/dependency';
import {
  Registration,
  getRegistrationId,
  getRegistrationSource
} from './registration';
import { Source } from './source';
import { dependencyNotFound, dependencyInvalidChecksum } from '../errors';

const debug = require('debug')('vba-blocks:registry-source');

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
      index: unixJoin(env.registry, name),
      packages: unixJoin(env.packages, name)
    };
    this.remote = { index, packages };
    this.sources = unixJoin(env.sources, name);

    debug(`pulling ${this.remote.index} to ${this.local.index}`);
    this.pulling = pullIndex(this.local.index, this.remote.index);
  }

  async resolve(dependency: Dependency): Promise<Registration[]> {
    const { name } = <RegistryDependency>dependency;
    const path = getPath(this.local.index, name);

    await this.pulling;
    if (!(await pathExists(path))) {
      throw dependencyNotFound(name, this.name);
    }

    const data = await readFile(path, 'utf8');
    const registrations: Registration[] = data
      .split(/\r?\n/)
      .filter((line: string) => !!line)
      .map((line: string) => JSON.parse(line))
      .filter((value: any) => value && !value.yanked)
      .map((value: string) => parseRegistration(this.name, value));

    return registrations;
  }

  async fetch(registration: Registration): Promise<string> {
    const url = getRemotePackage(this.remote.packages, registration);
    const file = getLocalPackage(this.local.packages, registration);

    const [_, checksum] = registration.source.split('#', 2);

    if (!(await pathExists(file))) {
      const unverifiedFile = await tmpFile();
      await download(url, unverifiedFile);

      const comparison = await getChecksum(unverifiedFile);
      if (comparison !== checksum) {
        throw dependencyInvalidChecksum(registration);
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
  if (!(await pathExists(local))) {
    const dir = dirname(local);
    await ensureDir(dir);
    await clone(remote, basename(local), dir);
  }

  await pull(local);
}

export function parseRegistration(registry: string, value: any): Registration {
  const { name, vers: version, cksum: checksum } = value;

  const dependencies: RegistryDependency[] = value.deps.map((dep: any) => {
    const { name, req } = dep;
    const dependency: RegistryDependency = {
      name,
      registry,
      version: req
    };

    return dependency;
  });

  return {
    id: getRegistrationId(name, version),
    source: getRegistrationSource('registry', registry, checksum),
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

  return unixJoin(index, ...parts, name);
}

function getRemotePackage(
  packages: string,
  registration: Registration
): string {
  const { name, version } = registration;
  return `${packages}/${name}/v${version}.block`;
}

function getLocalPackage(packages: string, registration: Registration): string {
  const { name, version } = registration;
  return unixJoin(packages, name, `v${version}.block`);
}

function getSource(sources: string, registration: Registration): string {
  const { name, version } = registration;
  const file = `v${version}`.replace(/\./g, '-');
  return unixJoin(sources, name, file);
}
