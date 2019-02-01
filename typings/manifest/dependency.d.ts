import { Version, RegistryDependency, PathDependency, GitDependency, Dependency } from './types';
export declare function parseDependencies(value: any, dir: string): Dependency[];
export declare function parseDependency(name: string, value: Version | any, dir: string): Dependency;
export declare function isRegistryDependency(dependency: Dependency): dependency is RegistryDependency;
export declare function isPathDependency(dependency: Dependency): dependency is PathDependency;
export declare function isGitDependency(dependency: Dependency): dependency is GitDependency;
