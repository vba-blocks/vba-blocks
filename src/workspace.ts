import { Manifest } from './manifest';
export { loadWorkspace } from './professional/workspace';

export interface Workspace {
  root: Manifest;
  members: Manifest[];
}
