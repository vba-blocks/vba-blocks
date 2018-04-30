import { Workspace } from '@vba-blocks/src/workspace';
import { Manifest } from '@vba-blocks/src/manifest';

export function createWorkspace(manifest: Manifest): Workspace {
  return { root: manifest, members: [] };
}
