import { Version, Dependency } from '../manifest';

export interface Registration {
  name: string;
  version: Version;
  dependencies: Dependency[];
  features: { [name: string]: string[] };

  source: string;
  checksum?: string;
}

export function getRegistrationId(registration: Registration): string {
  return `${registration.name}@${registration.version}`;
}
