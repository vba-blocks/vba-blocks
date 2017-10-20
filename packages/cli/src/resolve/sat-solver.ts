import { satisfies } from 'semver';
import { Solver, exactlyOne, atMostOne, implies, or } from 'logic-solver';
import { Workspace } from '../workspace';
import { Dependency } from '../manifest';
import { Registration } from '../sources';
import { DependencyGraph } from './dependency-graph';
import Resolver, { Resolution, ResolutionGraph } from './resolver';
import { has, unique } from '../utils';

export default async function solve(
  workspace: Workspace,
  resolver: Resolver
): Promise<DependencyGraph> {
  const dependencies = workspace.root.dependencies;

  await resolveDependencies(dependencies, resolver);
  const required = await optimizeResolved(resolver.graph, dependencies);

  const solver = new Solver();

  for (const [name, resolved] of resolver) {
    const { registered } = resolved;
    const isRequired = required.includes(name);
    const ids = registered.map(registration => registration.id);

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
      for (const dependency of registration.dependencies) {
        const resolved = resolver.graph.get(dependency.name);
        const matching = getMatching(dependency, resolved);

        solver.require(implies(registration.id, or(...matching)));
      }
    }
  }

  const solution = solver.solve();

  if (!solution) {
    throw new Error('Failed to resolve dependency graph for given manifest');
  }

  const ids: string[] = solution.getTrueVars();
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

export async function optimizeResolved(
  graph: ResolutionGraph,
  dependencies: Dependency[]
): Promise<string[]> {
  const required: string[] = [];
  const topLevel: { [name: string]: string } = {};

  for (const dependency of dependencies) {
    const { name } = dependency;
    required.push(name);

    if (has(dependency, 'version')) {
      topLevel[name] = dependency.version;
    }
  }

  for (const [name, resolution] of graph) {
    const { registered } = resolution;
    const range = topLevel[name] || unique(resolution.range).join(' || ');

    resolution.registered = registered
      .filter(registration => satisfies(registration.version, range))
      .reverse();
  }

  return required;
}

function getMatching(dependency: Dependency, resolved: Resolution): string[] {
  const { registered } = resolved;

  if (has(dependency, 'version')) {
    const { version } = dependency;

    return registered
      .filter(registration => satisfies(registration.version, version))
      .map(registration => registration.id);
  } else {
    return [];
  }
}
