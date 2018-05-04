import { Workspace } from '../../src/workspace';
import { Manifest } from '../../src/manifest';

export function createWorkspace(manifest: Manifest): Workspace {
  return { root: manifest, members: [] };
}
