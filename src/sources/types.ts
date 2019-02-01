import { Snapshot, Dependency } from '../manifest/types';

export interface Source {
  resolve: (dependency: Dependency) => Registration[] | Promise<Registration[]>;
  fetch: (registration: Registration) => string | Promise<string>;
}

export interface Sources {
  registry: { [name: string]: Source };
  git: Source;
  path: Source;
}

export interface RegistryOptions {
  name: string;
  index: string;
  packages: string;
}

export interface Registration extends Snapshot {
  id: string;
  source: string;
}
