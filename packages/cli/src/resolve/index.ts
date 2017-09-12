import { Config } from '../config';
import { Manifest } from '../manifest';
import { DependencyGraph } from './dependency-graph';
import { Lockfile, readLockfile, isLockfileValid } from '../lockfile';
import Resolver from './resolver';
import solveLatest from './latest-solver';
import solveSat from './sat-solver';

export { DependencyGraph, Resolver, solveLatest, solveSat };

export default async function resolve(
  config: Config,
  manifest: Manifest
): Promise<DependencyGraph> {
  const lockfile = await readLockfile(config);

  // If lockfile is up-to-date with manifest, use cached dependency graph
  if (lockfile && !isLockfileValid(lockfile, manifest)) {
    return lockfile.resolved;
  }

  // Load and update resolver
  const resolver = new Resolver(config);
  await resolver.update();

  // Seed preferred versions on resolver
  const preferred = lockfile ? lockfile.resolved : [];
  resolver.prefer(preferred);

  // Attempt latest solver, saving errors for recommendations on failure
  let conficts;
  try {
    return await solveLatest(config, manifest, resolver);
  } catch (err) {
    // TODO extract conflicts from latest solver error
  }

  // Fallback to SAT solver
  try {
    return await solveSat(config, manifest, resolver);
  } catch (err) {
    // No useful information from SAT solver failure, ignore
  }

  // TODO Include conflicts with error
  throw new Error('Unable to resolve dependency graph for given manifest');
}
