import { Dependency } from '../manifest/types';
import { Registration } from '../sources/types';
import { DependencyGraph } from './types';
export declare function getRegistration(graph: DependencyGraph, dependency: Dependency): Registration | undefined;
