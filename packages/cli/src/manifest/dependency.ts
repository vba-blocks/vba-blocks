import { ok } from 'assert';
import { satisfies as satisfiesSemver } from 'semver';
import { join } from 'path';
import { Version } from './version';
import { isString, has } from '../utils';
import { Registration } from '../sources';

export interface DependencyDetails {
  name: string;
  defaultFeatures?: boolean;
  features?: string[];
  optional?: boolean;
}

export interface RegistryDependency extends DependencyDetails {
  registry: string;
  version: string;
}

export interface PathDependency extends DependencyDetails {
  path: string;
}

export interface GitDependency extends DependencyDetails {
  git: string;
  tag?: string;
  branch?: string;
  rev?: string;
}

export type Dependency = RegistryDependency | PathDependency | GitDependency;

const EXAMPLE = `Example vba-block.toml:

  [dependencies]
  a = "^1.0.0"
  b = { version = "^0.1.0", optional = true }
  c = { path = "packages/c" }
  d = { git = "https://github.com/author/d" }
  e = { git = "https://github.com/author/e", branch = "next" }
  f = { git = "https://github.com/author/f", tag = "v1.0.0" }
  g = { git = "https://github.com/author/g", rev = "a1b2c3d4" }

  [dependencies.h]
  version = "^2.0.0"
  default-features = false
  features ["a", "b"]`;

export function parseDependencies(value: any, dir: string): Dependency[] {
  return Object.entries(value).map(([name, value]) =>
    parseDependency(name, value, dir)
  );
}

export function parseDependency(
  name: string,
  value: Version | any,
  dir: string
): Dependency {
  if (isString(value)) value = { version: value };

  const {
    features = [],
    'default-features': defaultFeatures = true,
    optional = false,
    registry = 'vba-blocks',
    version,
    path,
    git,
    tag,
    branch = 'master',
    rev
  }: {
    features?: string[];
    'default-features'?: boolean;
    optional?: boolean;
    registry?: string;
    version?: string;
    path?: string;
    git?: string;
    tag?: string;
    branch?: string;
    rev: string;
  } = value;

  ok(
    version || path || git,
    `Invalid dependency "${name}", no version, path, or git specified. ${EXAMPLE}`
  );

  const details = { name, defaultFeatures, features, optional };

  if (version) {
    return { ...details, registry, version };
  } else if (path) {
    return { ...details, path: join(dir, path) };
  } else {
    if (rev) return { ...details, git: git!, rev };
    else if (tag) return { ...details, git: git!, tag };
    else return { ...details, git: git!, branch };
  }
}

export function satisfies(value: Dependency, comparison: Dependency): boolean {
  if (isRegistryDependency(comparison)) {
    // Note: Order matters in value / comparison
    //
    // value = manifest / user value
    // comparison = lockfile value (more specific)
    return (
      isRegistryDependency(value) &&
      satisfiesSemver(comparison.version, value.version)
    );
  } else if (isPathDependency(comparison)) {
    return isPathDependency(value) && value.path === comparison.path;
  } else if (isGitDependency(comparison)) {
    if (!isGitDependency(value)) return false;

    if (has(value, 'rev') && has(comparison, 'rev'))
      return value.rev === comparison.rev;
    if (has(value, 'tag') && has(comparison, 'tag'))
      return value.tag === comparison.tag;
    if (has(value, 'branch') && has(comparison, 'branch'))
      return value.branch === comparison.branch;
  }

  return false;
}

export function isRegistryDependency(
  dependency: Dependency
): dependency is RegistryDependency {
  return has(dependency, 'registry');
}

export function isPathDependency(
  dependency: Dependency
): dependency is PathDependency {
  return has(dependency, 'path');
}

export function isGitDependency(
  dependency: Dependency
): dependency is GitDependency {
  return has(dependency, 'git');
}
