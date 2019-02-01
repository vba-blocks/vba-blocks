import { join } from '../utils/path';
import { getRegistration } from './dependency-graph';
import Resolver from './resolver';
import solveLatest from './latest-solver';
import { resolveFailed } from '../errors';
import env from '../env';
import { resolvingDependencies } from '../messages';

import { Config, Workspace } from '../types';
import { DependencyGraph } from './types';

const debug = require('debug')('vba-blocks:resolve');

export { getRegistration, Resolver };

export default async function resolve(
  config: Config,
  workspace: Workspace,
  preferred: DependencyGraph = []
): Promise<DependencyGraph> {
  env.reporter.log(resolvingDependencies());

  // Load, update, and seed resolver
  const resolver = new Resolver(config);
  resolver.prefer(preferred);

  // Attempt latest solver, saving errors for recommendations on failure
  try {
    return await solveLatest(workspace, resolver);
  } catch (err) {
    debug(`solveLatest failed with ${err}`);
    // TODO extract conflicts from latest solver error
  }

  // Fallback to SAT solver
  try {
    const { solve: solveSat } = await import('./sat-solver');
    return await solveSat(workspace, resolver);
  } catch (err) {
    debug(`solveSat failed with ${err}`);
    // No useful information from SAT solver failure, ignore
  }

  // TODO Include conflicts with error
  throw resolveFailed();
}
