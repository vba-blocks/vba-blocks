import { Version } from '../version';
import { has, isString } from '../utils';

export interface Dependency {
  name: string;
  default_features: boolean;
  features: string[];

  version?: Version;

  path?: string;

  git?: string;
  tag?: string;
  branch?: string;
  rev?: string;
}

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

  const { version, path, git, tag, branch = 'master', rev } = value;
  if (!version && !path && !git) {
    throw new Error(
      `Invalid dependency "${name}", no version, path, or git specified`
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

  const default_features = has(value, 'default-features')
    ? value['default-features']
    : true;
  const features = value.features || [];

  return Object.assign({ name, features, default_features }, dependency);
}
