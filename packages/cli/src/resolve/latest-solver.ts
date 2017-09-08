import { satisfies } from 'semver';
import { Config } from '../config';
import { Manifest, Dependency } from '../manifest';
import { Registration } from '../manager';
import { DependencyGraph } from './dependency-graph';
import Resolver from './resolver';

export default async function solve(
  config: Config,
  manifest: Manifest,
  resolver: Resolver
): Promise<DependencyGraph> {
  await resolveDependencies(manifest.dependencies, resolver);

  const graph = [];
  const errors = [];
  for (const [name, resolution] of resolver) {
    const matching = getMatching(resolution);

    if (!matching) {
      errors.push(resolution);
    } else {
      graph.push(matching);
    }
  }

  if (errors.length) {
    // TODO
    throw new Error('Unable to resolve dependency graph for given manifest');
  }

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
    const latest = getMatching(resolution) || registered[registered.length - 1];

    await resolveDependencies(latest.dependencies, resolver);
  }
}

export function getMatching(resolution): Registration | undefined {
  const range = resolution.range.join(' || ');
  const registered = resolution.registered.slice().reverse();
  return registered.find(registration =>
    satisfies(registration.version, range)
  );
}
