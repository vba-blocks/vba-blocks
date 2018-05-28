import env from './env';
import { Config, loadConfig } from './config';
import { Manifest, loadManifest } from './manifest';
import { Workspace, loadWorkspace } from './workspace';
import { fetch, Registration } from './sources';
import resolve, { DependencyGraph } from './resolve';
import { readLockfile, isLockfileValid } from './lockfile';
import { parallel, unixJoin, isString, tmpFolder } from './utils';

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

export interface LoadOptions {
  manifests?: boolean;
}

/**
 * Load project, starting at given dir
 *
 * - Loads manifest at given dir
 * - Loads workspace from that manifest
 * - Loads config
 * - Loads packages (with lockfile)
 */
export async function loadProject(options?: LoadOptions): Promise<Project>;
export async function loadProject(
  dir?: string | object,
  options?: LoadOptions
): Promise<Project> {
  if (!isString(dir)) {
    options = dir;
    dir = env.cwd;
  }
  const include_manifest = options ? !!options.manifests : false;

  const manifest = await loadManifest(dir);
  const workspace = await loadWorkspace(manifest);

  const config = await loadConfig();
  const lockfile = await readLockfile(workspace.root.dir);
  const has_dirty_lockfile = !lockfile || !isLockfileValid(lockfile, workspace);

  // Resolve packages from lockfile or from sources
  const packages =
    lockfile && !has_dirty_lockfile
      ? lockfile.packages
      : await resolve(config, workspace, lockfile ? lockfile.packages : []);

  const paths = {
    root: workspace.root.dir,
    dir: manifest.dir,
    build: unixJoin(manifest.dir, 'build'),
    backup: unixJoin(manifest.dir, 'build', '.backup'),
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
