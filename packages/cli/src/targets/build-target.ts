import { Config } from '../config';
import { Target, Source, Reference } from '../manifest';

export default async function buildTarget(
  config: Config,
  target: Target,
  graph: { src: Source[]; references: Reference[] }
) {
  // TODO
  // 1. Find binary from config and target
  // 2. Import src/references from BuildGraph (may need to remove outdated)
}
