import { satisfies } from 'semver';
import { loadManifest, Manifest } from '../manifest';
import {
  Dependency,
  isGitDependency,
  isPathDependency,
  isRegistryDependency
} from '../manifest/dependency';
import { Workspace } from '../professional/workspace';
import has from '../utils/has';
import { Lockfile, LOCKFILE_VERSION, MinimalSnapshot } from './lockfile';

/**
 * ## Is lockfile valid?
 *
 * - [ ] Lockfile version has not changed
 * - [ ] Workspace root manifest has not changed
 * - [ ] Workspace members have not changed
 */
export default async function isLockfileValid(
  lockfile: Lockfile,
  workspace: Workspace
): Promise<boolean> {
  if (!lockfile.metadata || lockfile.metadata.version !== LOCKFILE_VERSION) return false;

  if (!(await hasManifestChanged(workspace.root, lockfile.workspace.root))) return false;

  if (lockfile.workspace.members.length !== workspace.members.length) return false;

  const membersByName: { [name: string]: Manifest } = {};
  workspace.members.forEach(member => (membersByName[member.name] = member));

  for (const lockedMember of lockfile.workspace.members) {
    const currentMember = membersByName[lockedMember.name];
    if (!currentMember) return false;
    if (!(await hasManifestChanged(currentMember, lockedMember))) return false;
  }

  return true;
}

/**
 * ## Has manifest changed?
 *
 * - [ ] Has name changed?
 * - [ ] Have dependencies been added or removed?
 * - [ ] Are dependencies satisfied by lockfile versions?
 */
async function hasManifestChanged(current: Manifest, locked: MinimalSnapshot): Promise<boolean> {
  if (current.name !== locked.name) return false;

  return await haveDependenciesChanged(current, locked);
}

async function haveDependenciesChanged(
  current: Manifest,
  locked: MinimalSnapshot
): Promise<boolean> {
  const dependencies = current.dependencies.concat(current.devDependencies);

  if (dependencies.length !== locked.dependencies.length) return false;

  const dependenciesByName: { [name: string]: Dependency } = {};
  dependencies.forEach(dependency => {
    dependenciesByName[dependency.name] = dependency;
  });

  for (const lockedDependency of locked.dependencies) {
    const currentDependency = dependenciesByName[lockedDependency.name];
    if (!currentDependency) return false;
    if (!(await isDependencySatisfied(currentDependency, lockedDependency))) return false;
  }

  return true;
}

async function isDependencySatisfied(current: Dependency, locked: Dependency): Promise<boolean> {
  if (isRegistryDependency(locked)) {
    // Note: lockfile value is more specific
    // -> compare locked to current manifest's value
    return isRegistryDependency(current) && satisfies(locked.version, current.version);
  } else if (isPathDependency(locked)) {
    if (!isPathDependency(current)) return false;
    if (current.path !== locked.path) return false;

    // Load current version from manifest of path dependency
    const manifest = await loadManifest(current.path);
    return manifest.version === locked.version!;
  } else if (isGitDependency(locked)) {
    if (!isGitDependency(current)) return false;

    if (has(current, 'rev') && has(locked, 'rev')) return current.rev === locked.rev;
    if (has(current, 'tag') && has(locked, 'tag')) return current.tag === locked.tag;
    if (has(current, 'branch') && has(locked, 'branch')) return current.branch === locked.branch;
  }

  return false;
}
