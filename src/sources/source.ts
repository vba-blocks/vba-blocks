import { Config } from '../config';
import { Dependency } from '../manifest';
import { Registration } from './registration';

export interface Source {
  resolve: (dependency: Dependency) => Registration[] | Promise<Registration[]>;
  fetch: (registration: Registration) => string | Promise<string>;
}
