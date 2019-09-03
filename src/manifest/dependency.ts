import { manifestOk } from '../errors';
import has from '../utils/has';
import { isString } from '../utils/is';
import { extname, join, trailing } from '../utils/path';
import { Version } from './version';

/*
  # Dependency

  Three types of dependencies: registry, path, and git

  - registry: version | { version, registry? }

    Registry (default = "vba-blocks"):
    index + packages are loading in config and used for resolve and fetching

  - path: path
  - git: { git, branch?, tag?, rev? }

    Where git is path to git remote and revision is pulled from
    master, branch, tag, or rev
*/

export interface DependencyDetails {
  name: string;
  version?: Version;
}

export interface RegistryDependency extends DependencyDetails {
  registry: string;
  version: Version;
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
  b = { version = "^0.1.0" }
  c = { path = "packages/c" }
  d = { git = "https://github.com/author/d" }
  e = { git = "https://github.com/author/e", branch = "next" }
  f = { git = "https://github.com/author/f", tag = "v1.0.0" }
  g = { git = "https://github.com/author/g", rev = "a1b2c3d4" }

  [dependencies.h]
  version = "^2.0.0"`;

export function parseDependencies(value: any, dir: string): Dependency[] {
  return Object.entries(value).map(([name, value]) => parseDependency(name, value, dir));
}

export function parseDependency(name: string, value: Version | any, dir: string): Dependency {
  if (isString(value)) value = { version: value };

  let {
    registry = 'vba-blocks',
    version,
    path,
    git,
    tag,
    branch = 'master',
    rev
  }: {
    registry?: string;
    version?: string;
    path?: string;
    git?: string;
    tag?: string;
    branch?: string;
    rev?: string;
  } = value;

  manifestOk(
    version || path || git,
    `Invalid dependency "${name}", no version, path, or git specified. \n\n${EXAMPLE}`
  );

  if (version) {
    return { name, registry, version };
  } else if (path) {
    return { name, path: trailing(join(dir, path)) };
  } else {
    git = ensureGitUrl(git!);

    if (rev) return { name, git, rev };
    else if (tag) return { name, git, tag };
    else return { name, git, branch };
  }
}

export function isRegistryDependency(dependency: Dependency): dependency is RegistryDependency {
  return has(dependency, 'registry');
}

export function isPathDependency(dependency: Dependency): dependency is PathDependency {
  return has(dependency, 'path');
}

export function isGitDependency(dependency: Dependency): dependency is GitDependency {
  return has(dependency, 'git');
}

export function formatDependencies(dependencies: Dependency[]): object {
  const value: { [name: string]: any } = {};
  dependencies.forEach(dependency => {
    if (isRegistryDependency(dependency)) {
      const { name, registry, version } = dependency;
      value[name] = registry !== 'vba-blocks' ? { version, registry } : version;
    } else if (isPathDependency(dependency)) {
      const { name, path } = dependency;
      value[name] = path;
    } else {
      const { name, git, tag, branch, rev } = dependency;
      value[name] = { name, git };
      if (tag) value[name].tag = tag;
      if (branch) value[name].branch = branch;
      if (rev) value[name].rev = rev;
    }
  });

  return value;
}

function ensureGitUrl(value: string): string {
  if (extname(value!) === '.git') return value;

  return `${value}.git`;
}
