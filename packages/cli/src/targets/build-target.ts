import { Config } from '../config';
import { Manifest, Source, Reference, Target } from '../manifest';
import { DependencyGraph } from '../resolve';

export interface BuildGraph {
  src: Source[];
  references: Reference[];
}

export default async function buildTarget(
  config: Config,
  target: Target,
  graph: BuildGraph
) {
  // TODO
  // 1. Find binary from config and target
  // 2. Import src/references from BuildGraph (may need to remove outdated)
}
