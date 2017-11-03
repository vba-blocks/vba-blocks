import { ok } from 'assert';
import { join } from 'path';
import { pathExists, readFile, writeFile } from 'fs-extra';
import { parse as parseToml } from 'toml';
import { satisfies } from 'semver';
import env from './env';
import { isString, has, convertToToml } from './utils';
import { Config } from './config';
import { Snapshot, Manifest, Version, Dependency } from './manifest';
import { Workspace } from './workspace';
import { Registration, getRegistrationId } from './sources';
import { DependencyGraph, getRegistration } from './resolve';

export interface Lockfile {
  workspace: {
    root: Snapshot;
    members: Snapshot[];
  };
  packages: DependencyGraph;
}

type DependencyByName = { [name: string]: Dependency };

export async function readLockfile(dir: string): Promise<Lockfile | null> {
  const file = join(dir, 'vba-block.lock');
  if (!await pathExists(file)) return null;

  try {
    const toml = await readFile(file, 'utf8');
    const lockfile = fromToml(toml);

    return lockfile;
  } catch (err) {
    return null;
  }
}

export async function writeLockfile(
  dir: string,
  lockfile: Lockfile
): Promise<void> {
  const file = join(dir, 'vba-block.lock');
  const toml = toToml(lockfile);

  return writeFile(file, toml);
}

export function isLockfileValid(lockfile: Lockfile, workspace: Workspace) {
  // Compare root and members, looking for differences in version and dependencies
  if (lockfile.workspace.root.version !== workspace.root.version) return false;
  if (!compareDependencies(workspace.root, lockfile.workspace.root))
    return false;

  if (lockfile.workspace.members.length !== workspace.members.length)
    return false;

  const byName: { [name: string]: Snapshot } = {};
  workspace.members.forEach(member => (byName[member.name] = member));
  for (const member of lockfile.workspace.members) {
    const userMember = byName[member.name];
    if (!userMember || member.version !== userMember.version) return false;
    if (!compareDependencies(userMember, member)) return false;
  }
}

export function toToml(lockfile: Lockfile): string {
  const root = prepareManifest(lockfile.workspace.root, lockfile.packages);
  const members: any[] = lockfile.workspace.members.map((member: Manifest) =>
    prepareManifest(member, lockfile.packages)
  );
  const packages: any[] = lockfile.packages.map(
    (registration: Registration) => {
      const { name, version, source } = registration;
      const dependencies = registration.dependencies.map(dependency =>
        toDependencyId(dependency, lockfile.packages)
      );

      return {
        name,
        version,
        source,
        dependencies
      };
    }
  );

  return convertToToml({ root, members, packages });
}

export function fromToml(toml: string): Lockfile {
  const parsed = parseToml(toml);
  ok(has(parsed, 'root'), 'vba-blocks.toml is missing [root] field');

  // First pass through packages to load high-level information
  // (needed to map dependencies to parsed packages)
  const byName: DependencyByName = {};
  const packages = (parsed.packages || []).map((value: any) => {
    const { name, version, source, dependencies } = value;
    ok(
      name && version && source && Array.isArray(dependencies),
      'Invalid package in lockfile'
    );

    const pkg = {
      id: getRegistrationId(name, version),
      name,
      version,
      source,
      dependencies
    };
    byName[name] = pkg;

    return pkg;
  });

  // Hydrate dependencies of packages
  packages.forEach((pkg: any) => {
    pkg.dependencies = pkg.dependencies.map((id: string) =>
      getDependency(id, byName)
    );
  });

  const root = toManifest(parsed.root, byName);
  const members = (parsed.members || []).map((member: any) =>
    toManifest(member, byName)
  );

  return { workspace: { root, members }, packages };
}

function toManifest(value: any, byName: DependencyByName): Snapshot {
  const { name, version } = value;
  ok(
    name && version && Array.isArray(value.dependencies),
    'Invalid manifest in lockfile'
  );

  const dependencies = value.dependencies.map((id: string) =>
    getDependency(id, byName)
  );

  return {
    name,
    version,
    dependencies
  };
}

function prepareManifest(manifest: Snapshot, packages: DependencyGraph): any {
  const { name, version } = manifest;
  const dependencies = manifest.dependencies.map(dependency =>
    toDependencyId(dependency, packages)
  );

  return {
    name,
    version,
    dependencies
  };
}

function toDependencyId(dependency: Dependency, packages: DependencyGraph) {
  const registration = getRegistration(packages, dependency);
  ok(registration, 'No package found for dependency');

  const { version, source } = registration!;
  return `${dependency.name} ${version} ${source}`;
}

function getDependency(id: string, byName: DependencyByName): Dependency {
  const [name] = id.split(' ', 1);
  const dependency = byName[name];

  ok(dependency, `Package not found in lockfile, "${id}"`);

  return dependency;
}

function compareDependencies(user: Snapshot, locked: Snapshot): boolean {
  if (user.dependencies.length !== locked.dependencies.length) return false;

  const byName: { [name: string]: Dependency } = {};
  user.dependencies.forEach(
    dependency => (byName[dependency.name] = dependency)
  );

  for (const dependency of locked.dependencies) {
    const userValue = byName[dependency.name];
    if (!userValue) return false;

    // TODO Compare non-registry dependencies
    if (!has(userValue, 'version')) continue;
    if (!satisfies(dependency.version!, userValue.version!)) return false;
  }

  return true;
}
