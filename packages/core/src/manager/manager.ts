import { Config } from '../config';
import { Dependency } from '../manifest';
import { Registration } from './registration';

export interface Manager {
  prepare: (config: Config) => Promise<void>;
  resolve: (config: Config, dependency: Dependency) => Promise<Registration[]>;
  fetch: (config: Config, registration: Registration) => Promise<void>;
}
