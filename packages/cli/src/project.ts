import { join } from 'path';
import env from './env';
import { Config, loadConfig } from './config';
import { Manifest, Source, Reference, loadManifest } from './manifest';
import { Workspace } from './workspace';
import SourceManager, { Registration } from './sources';
import resolve, { DependencyGraph, getRegistration } from './resolve';

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

  // TODO Load workspace
  const workspace: Workspace = {
    root: manifest,
    members: []
  };

  const config = await loadConfig(manifest, workspace);
  const packages = await resolve(config, workspace);

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
    project.manifest.dependencies,
    async dependency => {
      const registration = getRegistration(project.packages, dependency);
      const path = await manager.fetch(registration);
      const manifest = await loadManifest(path);

      return manifest;
    }
  );

  return manifests;
}
