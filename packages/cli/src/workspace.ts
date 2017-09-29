import { Manifest } from './manifest';

export interface Workspace {
  root?: Manifest;
  members: Manifest[];
}
