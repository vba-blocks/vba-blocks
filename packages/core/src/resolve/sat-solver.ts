import { satisfies } from 'semver';
import { Solver, exactlyOne, atMostOne, implies, or } from 'logic-solver';

import { Config } from '../config';
import { Manifest, Dependency } from '../manifest';
import {
  isRegistryDependency,
  isPathDependency,
  isGitDependency
} from '../manifest/dependency';
import { Registration, getRegistrationId } from '../manager';
import { DependencyGraph } from './dependency-graph';
import Resolver, { Resolution, ResolutionGraph } from './resolver';
import { unique } from '../utils';

export default async function solve(
  config: Config,
  manifest: Manifest,
  resolver: Resolver
): Promise<DependencyGraph> {
  await resolveDependencies(manifest.dependencies, resolver);
  await optimizeResolved(resolver.graph);

  const solver = new Solver();
  const required = manifest.dependencies.map(dependency => dependency.name);

  for (const [name, resolved] of resolver) {
    const { registered } = resolved;
    const isRequired = required.includes(name);
    const ids = registered.map(getRegistrationId);

    if (isRequired) {
      solver.require(exactlyOne(...ids));
    } else {
      solver.require(atMostOne(...ids));
    }
  }

  const reversed = [...resolver].reverse();
  for (const [name, resolved] of reversed) {
    const { registered } = resolved;

    for (const registration of registered) {
      const id = getRegistrationId(registration);

      for (const dependency of registration.dependencies) {
        const resolved = resolver.graph.get(dependency.name);
        const matching = getMatching(dependency, resolved);

        solver.require(implies(id, or(...matching)));
      }
    }
  }

  const solution = solver.solve();

  if (!solution) {
    throw new Error('Failed to resolve dependency graph for given manifest');
  }

  const ids = solution.getTrueVars();
  const graph = ids.map(id => resolver.getRegistration(id));

  return graph;
}

export async function resolveDependencies(
  dependencies: Dependency[],
  resolver: Resolver
): Promise<void> {
  const resolved = await Promise.all(
    dependencies.map(dependency => resolver.get(dependency))
  );

  for (const resolution of resolved) {
    const { registered } = resolution;
    await Promise.all(
      registered.map(registration =>
        resolveDependencies(registration.dependencies, resolver)
      )
    );
  }
}

export async function optimizeResolved(graph: ResolutionGraph): Promise<void> {
  for (const [name, resolution] of graph) {
    const { registered } = resolution;
    const range = unique(resolution.range).join(' || ');

    resolution.registered = registered
      .filter(registration => satisfies(registration.version, range))
      .reverse();
  }
}

function getMatching(dependency: Dependency, resolved: Resolution): string[] {
  const { registered } = resolved;

  if (isRegistryDependency(dependency)) {
    const { version } = dependency;

    return registered
      .filter(registration => satisfies(registration.version, version))
      .map(getRegistrationId);
  } else if (isPathDependency(dependency)) {
    return [];
  } else {
    return [];
  }
}
