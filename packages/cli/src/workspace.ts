import { Manifest } from './manifest';

export interface Workspace {
  root: Manifest;
  members: Manifest[];
}

/**
 * Load workspace from given manifest
 * 
 * - Check for [package.workspace]
 * - Check for [workspace]
 * - Search up for vba-blocks.toml with [workspace]
 * 
 * @param {Manifest} manifest 
 * @returns {Promise<Workspace>}
 */
export async function loadWorkspace(manifest: Manifest): Promise<Workspace> {
  // TODO Load workspace
  return {
    root: manifest,
    members: []
  };
}
