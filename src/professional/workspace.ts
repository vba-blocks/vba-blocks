import { Manifest } from '../manifest/types';
import { Workspace } from '../types';

export async function loadWorkspace(manifest: Manifest): Promise<Workspace> {
  return {
    root: manifest,
    members: []
  };
}
