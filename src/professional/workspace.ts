import { Manifest } from '../manifest';
import { Workspace } from '../workspace';

export async function loadWorkspace(manifest: Manifest): Promise<Workspace> {
  return {
    root: manifest,
    members: []
  };
}
