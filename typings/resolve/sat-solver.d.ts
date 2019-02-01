import { Workspace } from '../types';
import { Dependency } from '../manifest/types';
import { DependencyGraph, Resolver, ResolutionGraph } from './types';
export declare function solve(workspace: Workspace, resolver: Resolver): Promise<DependencyGraph>;
export declare function resolveDependencies(dependencies: Dependency[], resolver: Resolver): Promise<void>;
export declare function optimizeResolved(graph: ResolutionGraph, dependencies: Dependency[]): Promise<string[]>;
