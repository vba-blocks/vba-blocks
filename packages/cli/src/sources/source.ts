import { Config } from '../config';
import { Dependency } from '../manifest';
import { Registration } from './registration';

export interface Source {
  match: (type: string | Dependency) => boolean;
  update?: (config: Config) => void | Promise<void>;
  resolve: (
    config: Config,
    dependency: Dependency
  ) => Registration[] | Promise<Registration[]>;
  fetch: (
    config: Config,
    registration: Registration
  ) => string | Promise<string>;
  toDependency: (registration: Registration) => Dependency;
}
