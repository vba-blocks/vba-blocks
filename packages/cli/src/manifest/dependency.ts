import { Version } from './version';
import { has, isString } from '../utils';

export type Dependency = RegistryDependency | PathDependency | GitDependency;

export interface BaseDependency {
  name: string;
  default_features: boolean;
  features: string[];
  optional?: boolean;
}

export interface RegistryDependency extends BaseDependency {
  version: Version;
}

export interface PathDependency extends BaseDependency {
  path: string;
}

export interface GitDependency extends BaseDependency {
  git: string;
  branch?: string;
  tag?: string;
  rev?: string;
}

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

export function parseDependencies(value: any): Dependency[] {
  return Object.entries(value).map(([name, value]) =>
    parseDependency(name, value)
  );
}

export function parseDependency(
  name: string,
  value: Version | any
): Dependency {
  if (isString(value)) value = { version: value };

  const {
    features = [],
    'default-features': default_features = true,
    optional = false,
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
    version?: string;
    path?: string;
    git?: string;
    tag?: string;
    branch?: string;
    rev?: string;
  } = value;

  if (!version && !path && !git) {
    throw new Error(
      `Invalid dependency "${name}", no version, path, or git specified. ${EXAMPLE}`
    );
  }

  let dependency;
  if (version) dependency = { version };
  else if (path) dependency = { path };
  else if (git) {
    if (rev) dependency = { git, rev };
    else if (tag) dependency = { git, tag };
    else dependency = { git, branch };
  }

  return Object.assign(
    { name, features, default_features, optional },
    dependency
  );
}

export function isRegistryDependency(
  dependency: Dependency
): dependency is RegistryDependency {
  return has(dependency, 'version');
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
