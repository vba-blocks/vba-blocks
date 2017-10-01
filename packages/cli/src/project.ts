import { Config } from './config';
import { Manifest, Source, Reference, loadManifest } from './manifest';
import { Workspace } from './workspace';
import SourceManager, { Registration } from './sources';
import resolve, { DependencyGraph, getRegistration } from './resolve';
import { parallel } from './utils';

export interface Project {
  manifest: Manifest;
  workspace: Workspace;
  packages: DependencyGraph;
}

export async function loadProject(config: Config): Promise<Project> {
  const manifest = await loadManifest(config.cwd);
  const workspace: Workspace = {
    root: manifest,
    members: []
  };

  const packages = await resolve(config, workspace);

  return {
    manifest,
    workspace,
    packages
  };
}

export async function fetchDependencies(
  config: Config,
  project: Project
): Promise<Manifest[]> {
  const manager = new SourceManager(config);
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
