import env from '../env';
import { join, dirname, basename, sanitize } from '../utils/path';
import download from '../utils/download';
import {
  checksum as getChecksum,
  ensureDir,
  pathExists,
  move,
  readFile,
  tmpFile
} from '../utils/fs';
import { clone, pull } from '../utils/git';
import { unzip } from '../utils/zip';
import { Dependency, RegistryDependency } from '../manifest/dependency';
import {
  Registration,
  getRegistrationId,
  getRegistrationSource
} from './registration';
import { Source } from './source';
import {
  dependencyNotFound,
  dependencyInvalidChecksum,
  sourceDownloadFailed
} from '../errors';

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
      index: join(env.registry, name),
      packages: join(env.packages, name)
    };
    this.remote = { index, packages };
    this.sources = join(env.sources, name);

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
      try {
        await download(url, unverifiedFile);
      } catch (err) {
        throw sourceDownloadFailed(registration.source, err);
      }

      const comparison = await getChecksum(unverifiedFile);
      if (comparison !== checksum) {
        throw dependencyInvalidChecksum(registration);
      }

      await move(unverifiedFile, file);
    }

    const src = getSource(this.sources, registration);
    await ensureDir(src);
    await unzip(file, src);

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

export function sanitizePackageName(name: string): string {
  return sanitize(name.replace('/', '--'));
}

function getPath(index: string, name: string): string {
  return join(index, sanitizePackageName(name));
}

export function getRemotePackage(
  packages: string,
  registration: Registration
): string {
  const { name, version } = registration;
  return `${packages}/${sanitizePackageName(name)}-v${version}.block`;
}

export function getLocalPackage(
  packages: string,
  registration: Registration
): string {
  const { name, version } = registration;
  return join(packages, `${sanitizePackageName(name)}-v${version}.block`);
}

export function getSource(sources: string, registration: Registration): string {
  const { name, version } = registration;
  return join(sources, `${sanitizePackageName(name)}-v${version}`);
}
