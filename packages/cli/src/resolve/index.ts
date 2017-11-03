import { Config } from '../config';
import { Workspace } from '../workspace';
import { Project } from '../project';
import { DependencyGraph, getRegistration } from './dependency-graph';
import Resolver from './resolver';
import solveLatest from './latest-solver';
import solveSat from './sat-solver';

export { DependencyGraph, getRegistration, Resolver, solveLatest, solveSat };

export default async function resolve(
  config: Config,
  workspace: Workspace,
  preferred: DependencyGraph = []
): Promise<DependencyGraph> {
  // Load, update, and see resolver
  const resolver = new Resolver(config);
  await resolver.update();
  resolver.prefer(preferred);

  // Attempt latest solver, saving errors for recommendations on failure
  try {
    return await solveLatest(workspace, resolver);
  } catch (err) {
    // TODO extract conflicts from latest solver error
  }

  // Fallback to SAT solver
  try {
    return await solveSat(workspace, resolver);
  } catch (err) {
    // No useful information from SAT solver failure, ignore
  }

  // TODO Include conflicts with error
  throw new Error('Unable to resolve dependency graph for given manifest');
}
