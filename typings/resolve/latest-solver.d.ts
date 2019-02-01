import { Workspace } from '../types';
import { Dependency } from '../manifest/types';
import { Registration } from '../sources/types';
import { DependencyGraph, Resolver, Resolution } from './types';
export default function solve(workspace: Workspace, resolver: Resolver): Promise<DependencyGraph>;
export declare function resolveDependencies(dependencies: Dependency[], resolver: Resolver): Promise<void>;
export declare function getMatching(resolution: Resolution): Registration | undefined;
