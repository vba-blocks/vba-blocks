import { unixJoin, tmpFolder } from '../../src/utils';
import { Project } from '../../src/project';
import { Manifest } from '../../src/manifest';
import resolve from '../../src/resolve';
import { getConfig } from './config';
import { createWorkspace } from './workspace';

export function createProject(manifest: Manifest): Project {
  const config = getConfig();
  const workspace = createWorkspace(manifest);

  const paths = {
    root: manifest.dir,
    dir: manifest.dir,
    build: unixJoin(manifest.dir, 'build'),
    backup: unixJoin(manifest.dir, 'build', '.backup'),
    staging: ''
  };

  return {
    manifest,
    workspace,
    packages: [],
    config,
    paths,
    has_dirty_lockfile: false
  };
}

export async function resolveProject(project: Project) {
  const packages = await resolve(project.config, project.workspace);

  return {
    ...project,
    packages
  };
}

export async function prepareStaging(project: Project): Promise<Project> {
  const staging = await tmpFolder();

  return {
    ...project,
    paths: {
      ...project.paths,
      staging
    }
  };
}
