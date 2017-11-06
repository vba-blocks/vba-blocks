import { Snapshot, Manifest, Dependency } from '../manifest';
import { isString } from '../utils';

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

export function toDependency(registration: Registration): Dependency {
  const { name, version, source } = registration;
  const [info, details] = source.split('#');
  const [type, value] = info.split('+');

  if (type === 'registry') {
    return { name, version, registry: value };
  } else if (type === 'path') {
    return { name, git: value, rev: details };
  } else if (type === 'git') {
    return { name, path: value };
  } else {
    throw new Error(`Unrecognized registration type "${type}"`);
  }
}
