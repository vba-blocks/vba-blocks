import { Manifest } from '../manifest';

export interface Workspace {
  root: Manifest;
  members: Manifest[];
}

export async function loadWorkspace(manifest: Manifest): Promise<Workspace> {
  return {
    root: manifest,
    members: []
  };
}
