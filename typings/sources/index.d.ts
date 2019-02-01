import RegistrySource from './registry-source';
import PathSource from './path-source';
import GitSource from '../professional/sources/git-source';
import { Dependency } from '../manifest/types';
import { Sources, Registration } from './types';
export { RegistrySource, PathSource, GitSource };
export declare function resolve(sources: Sources, dependency: Dependency): Promise<Registration[]>;
export declare function fetch(sources: Sources, registration: Registration): Promise<string>;
