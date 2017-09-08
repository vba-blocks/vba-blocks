import { Config } from '../config';
import { Manifest } from '../manifest';
import { DependencyGraph } from './dependency-graph';
import Resolver from './resolver';
import solveLatest from './latest-solver';
import solveSat from './sat-solver';

export default async function resolve(
  config: Config,
  manifest: Manifest
): Promise<DependencyGraph> {
  const resolver = new Resolver(config);
  await resolver.update();

  // 1. "Seed" with lockfile
  // 2. Attempt Latest Solver
  // 3. Fallback to SAT Solver
  // 4. Recommend minimum resolutions to fix (if needed)

  return [];
}
