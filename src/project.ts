import env from './env';
import { join } from './utils/path';
import { tmpFolder } from './utils/fs';
import parallel from './utils/parallel';
import { Config, loadConfig } from './config';
import { Manifest, loadManifest } from './manifest';
import { Workspace, loadWorkspace } from './workspace';
import { fetch } from './sources';
import resolve, { DependencyGraph } from './resolve';
import { readLockfile, isLockfileValid } from './lockfile';

export interface Project {
  manifest: Manifest;
  workspace: Workspace;
  packages: DependencyGraph;

  config: Config;
  paths: {
    root: string;
    dir: string;
    build: string;
    backup: string;
    staging: string;
  };
  has_dirty_lockfile: boolean;
}

/**
 * Load project from given directory / cwd
 *
 * 1. Load manifest in dir
 * 2. Load workspace from manifest
 * 3. Load lockfile
 * 4. Resolve dependencies
 */
export async function loadProject(dir: string = env.cwd): Promise<Project> {
  const manifest = await loadManifest(dir);

  const config = await loadConfig();
  const workspace = await loadWorkspace(manifest);
  const lockfile = await readLockfile(workspace.root.dir);

  // Resolve packages from lockfile or from sources
  const has_dirty_lockfile = !lockfile || !isLockfileValid(lockfile, workspace);
  const packages = !has_dirty_lockfile
    ? lockfile!.packages
    : await resolve(config, workspace, lockfile ? lockfile.packages : []);

  const paths = {
    root: workspace.root.dir,
    dir: manifest.dir,
    build: join(manifest.dir, 'build'),
    backup: join(manifest.dir, 'build', '.backup'),
    staging: await tmpFolder({ dir: env.staging })
  };

  return {
    manifest,
    workspace,
    packages,
    config,
    paths,
    has_dirty_lockfile
  };
}

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
export async function fetchDependencies(
  project: FetchProject
): Promise<Manifest[]> {
  const manifests = await parallel(
    project.packages,
    async registration => {
      const path = await fetch(project.config.sources, registration);
      const manifest = await loadManifest(path);

      return manifest;
    },
    { progress: env.reporter.progress('Fetch dependencies') }
  );

  return manifests;
}
