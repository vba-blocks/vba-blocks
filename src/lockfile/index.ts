import { ok } from 'assert';
import env from '../env';
import { CliError, ErrorCode } from '../errors';
import { Manifest, Snapshot } from '../manifest';
import { Dependency } from '../manifest/dependency';
import { DEFAULT_VERSION } from '../manifest/version';
import { Project } from '../project.js';
import { getRegistration } from '../resolve';
import { DependencyGraph } from '../resolve/dependency-graph';
import {
  getRegistrationId,
  getRegistrationSource,
  getSourceParts,
  Registration,
  toDependency
} from '../sources/registration';
import { pathExists, readFile, writeFile } from '../utils/fs';
import has from '../utils/has';
import { join, relative, trailing } from '../utils/path';
import { parse as parseToml, toLockfile as convertToLockfileToml } from '../utils/toml';
import { Lockfile, LOCKFILE_VERSION } from './lockfile';

const debug = env.debug('vba-blocks:lockfile');

type DependencyByName = Map<string, Dependency>;

export { default as isLockfileValid } from './is-lockfile-valid';

/**
 * Read lockfile at given dir (if present)
 * (for invalid lockfile, errors are ignored and treated as no lockfile)
 */
export async function readLockfile(dir: string): Promise<Lockfile | null> {
  const file = join(dir, 'vba-block.lock');
  debug(`Reading lockfile from ${file}`);

  if (!(await pathExists(file))) {
    debug(`Not found`);
    return null;
  }

  try {
    const toml = await readFile(file, 'utf8');
    return await fromToml(toml, dir);
  } catch (err) {
    debug(`Error reading/parsing`);
    debug(err);

    return null;
  }
}

/**
 * Write lockfile for project to given dir
 *
 * @throws LockfileWriteFailed
 */
export async function writeLockfile(dir: string, project: Project): Promise<void> {
  const file = join(dir, 'vba-block.lock');
  debug(`Writing lockfile to ${file}`);

  try {
    const toml = toToml(project, dir);
    await writeFile(file, toml);
  } catch (err) {
    debug('Error converting/writing');
    debug(err);

    throw new CliError(ErrorCode.LockfileWriteFailed, `Failed to write lockfile to "${file}".`);
  }
}

/**
 * Convert project to lockfile toml, alphabetized and with trailing commas
 * (should be suitable for VCS)
 */
export function toToml(project: Project, dir: string): string {
  const root = toLockfileManifest(project.workspace.root, project.packages, dir);
  const members: any[] = project.workspace.members.map(member =>
    toLockfileManifest(member, project.packages, dir)
  );

  const packages: any[] = project.packages.sort(byPackageName).map((registration: Registration) => {
    const { name, version, source } = registration;
    const dependencies = registration.dependencies.map(dependency =>
      toDependencyId(dependency, project.packages, dir)
    );

    return {
      name,
      version,
      source: toLockfileSource(source, dir),
      dependencies
    };
  });

  const metadata = { version: LOCKFILE_VERSION };
  const toml = convertToLockfileToml({ metadata, root, members, packages });

  return `${toml}`;
}

/**
 * Load lockfile from toml (including "hydrating" dependencies from packages)
 */
export async function fromToml(toml: string, dir: string): Promise<Lockfile> {
  const parsed = await parseToml(toml);
  ok(has(parsed, 'root'), 'vba-block.lock is missing [root] field');

  const metadata = parsed.metadata;

  // First pass through packages to load high-level information
  // (needed to map dependencies to parsed packages)
  const byName: DependencyByName = new Map();
  const packages = (parsed.packages || []).map((value: any) => {
    const { name, version, source, dependencies } = value;
    ok(name && version && source && Array.isArray(dependencies), 'Invalid package in lockfile');

    const registration = {
      id: getRegistrationId(name, version),
      name,
      version,
      source: toSource(source, dir),
      dependencies
    };

    byName.set(name, toDependency(registration));

    return registration;
  });

  // Hydrate dependencies of packages
  packages.forEach((registration: any) => {
    registration.dependencies = registration.dependencies.map((id: string) =>
      getDependency(id, byName)
    );
  });

  // Load manifests for workspace
  const root = toManifest(parsed.root, byName);
  const members: Snapshot[] = (parsed.members || []).map((member: any) =>
    toManifest(member, byName)
  );

  return { metadata, workspace: { root, members }, packages };
}

/**
 * Convert raw toml value to manifest
 */
function toManifest(value: any, dependencyByName: DependencyByName): Snapshot {
  const { name, version } = value;
  ok(name && version && Array.isArray(value.dependencies), 'Invalid manifest in lockfile');

  // "Hydrate" dependencies from ids
  const dependencies = value.dependencies.map((id: string) => getDependency(id, dependencyByName));

  return {
    name,
    version,
    dependencies
  };
}

interface LockfileManifest {
  name: string;
  version?: string;
  dependencies: string[];
}

/**
 * Get toml from manifest
 */
function toLockfileManifest(
  manifest: Manifest,
  packages: DependencyGraph,
  dir: string
): LockfileManifest {
  const { name, version } = manifest;

  // Convert dependencies and dev-dependencies to ids
  const all_dependencies = manifest.dependencies.concat(manifest.devDependencies);
  const dependencies = all_dependencies.map(dependency =>
    toDependencyId(dependency, packages, dir)
  );

  if (version === DEFAULT_VERSION) {
    return { name, dependencies };
  }

  return {
    name,
    version,
    dependencies
  };
}

/**
 * Get toml from source string
 * (Convert full path to relative to root dir)
 */
function toLockfileSource(source: string, dir: string): string {
  const { type, value, details } = getSourceParts(source);
  if (type !== 'path') return source;

  const relativePath = trailing(relative(dir, value));
  return getRegistrationSource(type, relativePath, details);
}

/**
 * "Hydrate" registration source from raw toml
 * (Convert relative paths to absolute)
 */
function toSource(source: string, dir: string): string {
  const { type, value, details } = getSourceParts(source);
  if (type !== 'path') return source;

  const absolutePath = join(dir, value);
  return getRegistrationSource(type, absolutePath, details);
}

/**
 * Convert dependency to unique id
 *
 * Minimum information needed for lockfile:
 * "{name} {version} {source}"
 */
function toDependencyId(dependency: Dependency, packages: DependencyGraph, dir: string) {
  const registration = getRegistration(packages, dependency);
  ok(registration, `No package found for dependency "${dependency.name}"`);

  let { version, source } = registration!;
  const { type, value, details } = getSourceParts(source);

  if (type === 'path') {
    const relativePath = trailing(relative(dir, value));
    source = getRegistrationSource(type, relativePath, details);
  }

  return `${dependency.name} ${version} ${source}`;
}

function getDependency(id: string, dependencyByName: DependencyByName): Dependency {
  const [name] = id.split(' ', 1);
  const dependency = dependencyByName.get(name);

  ok(dependency, `Package not found in lockfile, "${id}"`);

  return dependency!;
}

function byPackageName(a: Registration, b: Registration) {
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
}
