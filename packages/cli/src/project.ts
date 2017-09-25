import { Config } from './config';
import { Manifest, loadManifest } from './manifest';
import resolve, { DependencyGraph } from './resolve';

export interface Workspace {
  root: Manifest;
  members: Manifest[];
}

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

  // TODO resolve based on workspace, rather than manifest
  const packages = await resolve(config, manifest);

  return {
    manifest,
    workspace,
    packages
  };
}
