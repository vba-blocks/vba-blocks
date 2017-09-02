import { Config } from '../config';
import { Manifest } from '../manifest';
import { DependencyGraph } from './dependency-graph';
import { readLockfile, writeLockfile } from './lockfile';
import solveLatest from './latest-solver';
import solveSat from './sat-solver';
import Resolver from './resolver';

export default async function resolve(
  config: Config,
  manifest: Manifest
): Promise<DependencyGraph> {
  const resolver = new Resolver(config);

  // 1. "Seed" with lockfile
  // 2. Attempt Latest Solver
  // 3. Fallback to SAT Solver
  // 4. Recommend minimum resolutions to fix (if needed)
  // 5. On success, write lockfile

  return [];
}
