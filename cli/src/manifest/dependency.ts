import { Version } from '../version';
import { has, isString } from '../utils';

export interface Dependency {
  name: string;
  version?: Version;

  path?: string;

  git?: string;
  tag?: string;
  branch?: string;
  rev?: string;
}

export function parseDependency(name, value) {
  if (isString(value)) value = { version: value };

  const { version, path, git, tag, branch = 'master', rev } = value;

  if (version) return { name, version };
  if (path) return { name, path };
  if (git) {
    if (rev) return { name, git, rev };
    if (tag) return { name, git, tag };
    return { name, git, branch };
  }

  throw new Error(
    `Invalid dependency "${name}", no version, path, or git specified`
  );
}
