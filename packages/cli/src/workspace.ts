import { Manifest } from './manifest';

export interface Workspace {
  root: Manifest;
  members: Manifest[];
}

export async function loadWorkspace(manifest: Manifest): Promise<Workspace> {
  // TODO Load workspace
  return {
    root: manifest,
    members: []
  };
}
