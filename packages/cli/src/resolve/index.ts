import { Config } from '../config';
import { Workspace } from '../workspace';
import { Project } from '../project';
import { DependencyGraph, fetchDependencies } from './dependency-graph';
import { readLockfile, isLockfileValid } from '../lockfile';
import Resolver from './resolver';
import solveLatest from './latest-solver';
import solveSat from './sat-solver';

export { DependencyGraph, fetchDependencies, Resolver, solveLatest, solveSat };

export default async function resolve(
  config: Config,
  workspace: Workspace
): Promise<DependencyGraph> {
  const lockfile = await readLockfile(config);

  // If lockfile is up-to-date with manifest, use cached dependency graph
  if (lockfile && !isLockfileValid(lockfile, workspace)) {
    return lockfile.packages;
  }

  // Load and update resolver
  const resolver = new Resolver(config);
  await resolver.update();

  // Seed preferred versions on resolver
  const preferred = lockfile ? lockfile.packages : [];
  resolver.prefer(preferred);

  // Attempt latest solver, saving errors for recommendations on failure
  let conficts;
  try {
    return await solveLatest(config, workspace, resolver);
  } catch (err) {
    // TODO extract conflicts from latest solver error
  }

  // Fallback to SAT solver
  try {
    return await solveSat(config, workspace, resolver);
  } catch (err) {
    // No useful information from SAT solver failure, ignore
  }

  // TODO Include conflicts with error
  throw new Error('Unable to resolve dependency graph for given manifest');
}
