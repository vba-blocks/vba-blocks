import { Manifest } from '../../src/manifest';
import { Workspace } from '../../src/workspace';

export function toWorkspace(manifest: Manifest): Workspace {
  return { root: manifest, members: [] };
}
