import { Manifest } from './manifest/types';
import { DependencyGraph } from './resolve/types';
import { Config, Project } from './types';
/**
 * Load project from given directory / cwd
 *
 * 1. Load manifest in dir
 * 2. Load workspace from manifest
 * 3. Load lockfile
 * 4. Resolve dependencies
 */
export declare function loadProject(dir?: string): Promise<Project>;
export interface FetchProject {
    manifest: Manifest;
    packages: DependencyGraph;
    config: Config;
}
/**
 * Fetch all dependencies for project
 * (based on already resolved project.packages)
 *
 * After sources complete fetches, manifests are loaded and returned for each package
 */
export declare function fetchDependencies(project: FetchProject): Promise<Manifest[]>;
export interface ProjectOptions {
    type?: 'project' | 'package';
}
/**
 * Initialize new project
 *
 * Minimum requirements: name and dir
 */
export declare function initProject(name: string, dir: string, options?: ProjectOptions): Promise<Project>;
