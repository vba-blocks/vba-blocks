import * as semver from 'semver';
import * as Logic from 'logic-solver';
import { forEach, map, pluck } from './utils';
import {
  resolveDependencies,
  FlatGraph,
  FlatGraphNode
} from './resolve-dependencies';

export { resolveDependencies, FlatGraph, FlatGraphNode };

export type Version = string;
export type Dependency = { name: string; version: Version };

export interface Resolver {
  (name: string): Promise<PackageInfo[]>;
}

export interface PackageInfo {
  id?: string;
  name: string;
  version: Version;
  dependencies: Dependency[];
}

export interface Solution {
  success: boolean;
  result?: string[];
}

/**
 * Solve for the resolved flat dependency tree given a set of root dependencies
 */
export async function solve(
  dependencies: Dependency[] | { [name: string]: Version },
  resolver: Resolver
): Promise<Solution> {
  if (!Array.isArray(dependencies))
    dependencies = toArray<Dependency>(dependencies);

  const graph = await resolveDependencies(dependencies, resolver);
  const solver = new Logic.Solver();

  forEach(graph.values(), node => {
    const { name, versions, required } = node;
    const ids = pluck(versions, 'id');

    if (required) {
      solver.require(Logic.exactlyOne(...ids));
    } else {
      solver.require(Logic.atMostOne(...ids));
    }
  });

  const reversed = [...graph.values()].reverse();
  forEach(reversed, node => {
    const { versions } = node;

    forEach(versions, info => {
      const { id } = info;
      forEach(info.dependencies, dependency => {
        const matching = getMatching(dependency, graph);
        solver.require(Logic.implies(id, Logic.or(...matching)));
      });
    });
  });

  const solution = solver.solve();
  if (!solution) return { success: false };

  return {
    success: true,
    result: solution.getTrueVars()
  };
}

function getMatching(dependency, graph) {
  const { name, version: req } = dependency;
  const versions = graph.get(name).versions;

  const matching = versions
    .filter(({ version }) => semver.satisfies(version, req))
    .map(version => version.id);

  return matching;
}

function toArray<T>(dependencies): T[] {
  return map(Object.entries(dependencies), ([name, version]) => {
    return { name, version };
  });
}
