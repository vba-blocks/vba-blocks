import { ok } from 'assert';
import { join } from 'path';
import env from './env';
import { Config, loadConfig } from './config';
import { Manifest, loadManifest } from './manifest';
import { Workspace, loadWorkspace } from './workspace';
import SourceManager from './sources';
import resolve, { DependencyGraph } from './resolve';
import { readLockfile, isLockfileValid } from './lockfile';
import { parallel } from './utils';

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
  };
}

export async function loadProject(dir?: string): Promise<Project> {
  const manifest = await loadManifest(dir || env.cwd);
  const workspace = await loadWorkspace(manifest);

  const config = await loadConfig();
  const lockfile = await readLockfile(workspace.root.dir);
  const packages =
    lockfile && isLockfileValid(lockfile, workspace)
      ? lockfile.packages
      : await resolve(config, workspace, lockfile ? lockfile.packages : []);

  const paths = {
    root: workspace.root.dir,
    dir: manifest.dir,
    build: join(manifest.dir, 'build'),
    backup: join(manifest.dir, 'build', '.backup')
  };

  return {
    manifest,
    workspace,
    packages,
    config,
    paths
  };
}

export async function fetchDependencies(project: Project): Promise<Manifest[]> {
  const manager = new SourceManager(project.config);
  const manifests = await parallel(
    project.packages,
    async registration => {
      const path = await manager.fetch(registration);
      const manifest = await loadManifest(path);

      return manifest;
    },
    { progress: env.reporter.progress('Fetch dependencies') }
  );

  return manifests;
}
