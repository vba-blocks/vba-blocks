import { Config } from '../config';
import { BuildGraph } from './build-graph';
import { Target } from '../manifest';

export default async function buildTarget(
  config: Config,
  target: Target,
  graph: BuildGraph
) {
  // TODO
  // 1. Find binary from config and target
  // 2. Import src/references from BuildGraph (may need to remove outdated)
}
