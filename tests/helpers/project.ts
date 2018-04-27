import { unixJoin } from '../../src/utils';
import { Manifest } from '../../src/manifest';
import { Project } from '../../src/project';
import resolve from '../../src/resolve';
import { toWorkspace } from './workspace';
import { getConfig } from '../helpers/config';

export async function toProject(manifest: Manifest): Promise<Project> {
  const config = getConfig();
  const workspace = toWorkspace(manifest);
  const packages = await resolve(config, workspace);
  const paths = {
    root: workspace.root.dir,
    dir: manifest.dir,
    build: unixJoin(manifest.dir, 'build'),
    backup: unixJoin(manifest.dir, 'build', '.backup')
  };

  return { manifest, workspace, packages, config, paths };
}
