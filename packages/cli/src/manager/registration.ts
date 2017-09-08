import { Snapshot } from '../manifest';
import { isString } from '../utils';

export interface Registration extends Snapshot {
  id: string;
  source: string;
}

export function fromSnapshot(snapshot: Snapshot, source: string): Registration {
  const { name, version, dependencies, features } = snapshot;

  return {
    id: getRegistrationId(snapshot),
    source,
    name,
    version,
    dependencies,
    features
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
