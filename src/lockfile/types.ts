import { Snapshot } from '../manifest/types';
import { DependencyGraph } from '../resolve/types';

export interface Lockfile {
  metadata?: { version: string };
  workspace: {
    root: Snapshot;
    members: Snapshot[];
  };
  packages: DependencyGraph;
}
