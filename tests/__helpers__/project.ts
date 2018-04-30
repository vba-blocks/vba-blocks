import { unixJoin } from '@vba-blocks/src/utils';
import { Project } from '@vba-blocks/src/project';
import { Manifest } from '@vba-blocks/src/manifest';
import resolve from '@vba-blocks/src/resolve';
import { getConfig } from './config';
import { createWorkspace } from './workspace';

export function createProject(manifest: Manifest): Project {
  const config = getConfig();
  const workspace = createWorkspace(manifest);

  const paths = {
    root: manifest.dir,
    dir: manifest.dir,
    build: unixJoin(manifest.dir, 'build'),
    backup: unixJoin(manifest.dir, 'build', '.backup')
  };

  return {
    manifest,
    workspace,
    packages: [],
    config,
    paths,
    manifests: null,
    dirty_lockfile: false
  };
}

export async function resolveProject(project: Project) {
  // TODO maybe load manifests too
  const packages = await resolve(project.config, project.workspace);

  return {
    ...project,
    packages
  };
}
