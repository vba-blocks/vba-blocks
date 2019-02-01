import { join, trailing } from '../utils/path';
import { isString } from '../utils/is';
import has from '../utils/has';
import { manifestOk } from '../errors';
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
  version = "^2.0.0"`;
export function parseDependencies(value, dir) {
    return Object.entries(value).map(([name, value]) => parseDependency(name, value, dir));
}
export function parseDependency(name, value, dir) {
    if (isString(value))
        value = { version: value };
    const { registry = 'vba-blocks', version, path, git, tag, branch = 'master', rev } = value;
    manifestOk(version || path || git, `Invalid dependency "${name}", no version, path, or git specified. ${EXAMPLE}`);
    const details = { name };
    if (version) {
        return { ...details, registry, version };
    }
    else if (path) {
        return { ...details, path: trailing(join(dir, path)) };
    }
    else {
        if (rev)
            return { ...details, git: git, rev };
        else if (tag)
            return { ...details, git: git, tag };
        else
            return { ...details, git: git, branch };
    }
}
export function isRegistryDependency(dependency) {
    return has(dependency, 'registry');
}
export function isPathDependency(dependency) {
    return has(dependency, 'path');
}
export function isGitDependency(dependency) {
    return has(dependency, 'git');
}
