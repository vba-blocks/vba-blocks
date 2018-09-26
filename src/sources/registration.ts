import { parse as parseQuerystring } from 'querystring';
import { Snapshot, Dependency } from '../manifest';
import has from '../utils/has';
import { isString } from '../utils/is';
import { sourceUnrecognizedType } from '../errors';

export interface Registration extends Snapshot {
  id: string;
  source: string;
}

export function fromSnapshot(snapshot: Snapshot, source: string): Registration {
  const { name, version, dependencies } = snapshot;

  return {
    id: getRegistrationId(snapshot),
    source,
    name,
    version,
    dependencies
  };
}

export function getRegistrationId(name: Snapshot): string;
export function getRegistrationId(name: string, version: string): string;
export function getRegistrationId(
  name: string | Snapshot,
  version?: string
): string {
  if (!isString(name)) {
    version = name.version;
    name = name.name;
  }

  return `${name}@${version}`;
}

export function getRegistrationSource(
  type: string,
  value: string,
  details?: string
): string {
  let source = `${type}+${value}`;
  if (details) {
    source += `#${details}`;
  }

  return source;
}

export function getSourceParts(
  source: string
): { type: string; value: string; details: string | undefined } {
  const [info, ...details] = source.split('#');
  const [type, ...value] = info.split('+');

  return { type, value: value.join('+'), details: details.join('#') };
}

export function toDependency(registration: Registration): Dependency {
  const { name, version, source } = registration;
  const { type, value, details } = getSourceParts(source);

  if (type === 'registry') {
    return { name, version, registry: value };
  } else if (type === 'git') {
    // For git, tag / branch and/or rev are encoded as querystring
    const gitDetails = parseQuerystring(details!);
    return { name, git: value, ...gitDetails };
  } else if (type === 'path') {
    return { name, path: value, version };
  } else {
    throw sourceUnrecognizedType(type);
  }
}

export function isRegistration(
  value: Registration | Dependency
): value is Registration {
  return has(value, 'source');
}
