import { join } from 'path';
import { Config } from '../config';
import { Workspace } from '../workspace';
import { Project } from '../project';
import { DependencyGraph, getRegistration } from './dependency-graph';
import Resolver from './resolver';
import solveLatest from './latest-solver';
import { resolveFailed } from '../errors';

const debug = require('debug')('vba-blocks:resolve');

export { DependencyGraph, getRegistration, Resolver };

export default async function resolve(
  config: Config,
  workspace: Workspace,
  preferred: DependencyGraph = []
): Promise<DependencyGraph> {
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
    const { solve: solveSat } = require(join(__dirname, 'sat-solver'));
    return await solveSat(workspace, resolver);
  } catch (err) {
    debug(`solveSat failed with ${err}`);
    // No useful information from SAT solver failure, ignore
  }

  // TODO Include conflicts with error
  throw resolveFailed();
}
