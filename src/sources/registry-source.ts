import dedent from 'dedent/macro';
import env from '../env';
import { CliError, ErrorCode } from '../errors';
import { Dependency, RegistryDependency } from '../manifest/dependency';
import { Message } from '../messages';
import download from '../utils/download';
import {
  checksum as getChecksum,
  ensureDir,
  move,
  pathExists,
  readFile,
  tmpFile
} from '../utils/fs';
import { clone, isGitRepository, pull } from '../utils/git';
import { basename, dirname, join, sanitize } from '../utils/path';
import { unzip } from '../utils/zip';
import { getRegistrationId, getRegistrationSource, Registration } from './registration';
import { Source } from './source';

const debug = env.debug('vba-blocks:registry-source');

export interface RegistryOptions {
  name: string;
  index: string;
  packages: string;
}

export default class RegistrySource implements Source {
  name: string;
  local: { index: string; packages: string };
  remote: { index: string; packages: string };
  private sources: string;
  private pulling?: Promise<void>;
  private up_to_date: boolean;

  constructor({ name, index, packages }: RegistryOptions) {
    this.name = name;
    this.local = {
      index: join(env.registry, name),
      packages: join(env.packages, name)
    };
    this.remote = { index, packages };

    this.sources = join(env.sources, name);
    this.up_to_date = false;
  }

  async resolve(dependency: Dependency): Promise<Registration[]> {
    if (!this.up_to_date) await this.pull();

    const { name } = <RegistryDependency>dependency;
    const path = getPath(this.local.index, name);

    if (!(await pathExists(path))) {
      throw new CliError(
        ErrorCode.DependencyNotFound,
        `Dependency "${name}" not found in registry "${this.name}".`
      );
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
    const [algorithm, hash] = checksum.split('-');

    if (!(await pathExists(file))) {
      const unverifiedFile = await tmpFile();
      try {
        await download(url, unverifiedFile);
      } catch (err) {
        throw new CliError(
          ErrorCode.SourceDownloadFailed,
          `Failed to download "${registration.source}".`,
          err
        );
      }

      const comparison = await getChecksum(unverifiedFile, algorithm);
      if (comparison !== hash) {
        debug(`Checksum failed for ${unverifiedFile}`);
        debug(`Expected ${hash} (${algorithm}), received ${comparison}`);

        throw new CliError(
          ErrorCode.DependencyInvalidChecksum,
          dedent`
            Dependency "${registration.name}" failed validation.

            The downloaded file signature for ${registration.id}
            does not match the signature in the registry.
          `
        );
      }

      await move(unverifiedFile, file);
    }

    const src = getSource(this.sources, registration);
    await ensureDir(src);
    await unzip(file, src);

    return src;
  }

  async pull() {
    if (this.pulling) return this.pulling;

    this.pulling = pullIndex(this.local.index, this.remote.index);
    await this.pulling;

    this.up_to_date = true;
    this.pulling = undefined;
  }
}

export async function pullIndex(local: string, remote: string) {
  const has_local_directory = await pathExists(local);
  if (has_local_directory && !isGitRepository(local)) {
    // For local registry, skip clone + pull
    // if directory exists without git repository
    env.reporter.log(
      Message.RegistrySourceLocalOnly,
      '(local registry is not a git repository, skipping pull)'
    );
    return;
  }

  if (!has_local_directory) {
    await ensureDir(dirname(local));

    try {
      await clone(remote, basename(local), dirname(local));
    } catch (err) {
      throw new CliError(
        ErrorCode.RegistryCloneFailed,
        `Failed to clone registry from ${remote}`,
        err
      );
    }
  }

  try {
    await pull(local);
  } catch (err) {
    debug('Pull failed', err);

    // If pull fails (but repository exists)
    // treat as offline and still attempt to resolve
    env.reporter.log(
      Message.RegistrySourceSkipPull,
      '(failed to update local registry, resolving with previously loaded values)'
    );
  }
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

export function getRemotePackage(packages: string, registration: Registration): string {
  const { name, version } = registration;
  return `${packages}/${sanitizePackageName(name)}-v${version}.block`;
}

export function getLocalPackage(packages: string, registration: Registration): string {
  const { name, version } = registration;
  return join(packages, `${sanitizePackageName(name)}-v${version}.block`);
}

export function getSource(sources: string, registration: Registration): string {
  const { name, version } = registration;
  return join(sources, `${sanitizePackageName(name)}-v${version}`);
}
