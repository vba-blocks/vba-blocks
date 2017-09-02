import * as semver from 'semver';
import { Config } from '../config';
import { Manifest, Dependency } from '../manifest';
import { Registration } from '../registry';
import { DependencyGraph } from './dependency-graph';
import Resolver from './resolver';
import * as Logic from 'logic-solver';

export default async function solve(
  config: Config,
  manifest: Manifest,
  resolver: Resolver
): Promise<DependencyGraph> {
  await resolveDependencies(manifest.dependencies, resolver);

  const solver = new Logic.Solver();
  const required = manifest.dependencies.map(dependency => dependency.name);

  for (const resolved of resolver) {
    const { name, registered } = resolved;
    const isRequired = required.includes(name);
    const ids = registered.map(
      registration => `${name}@${registration.version}`
    );

    if (isRequired) {
      solver.require(Logic.exactlyOne(...ids));
    } else {
      solver.require(Logic.atMostOne(...ids));
    }
  }

  const reversed = [...resolver].reverse();
  for (const resolved of reversed) {
    const { name, registered } = resolved;

    for (const registration of registered) {
      const id = `${name}@${registration.version}`;

      for (const dependency of registration.dependencies) {
        const matching = getMatching(dependency, resolver);
        solver.require(Logic.implies(id, Logic.or(...matching)));
      }
    }
  }

  const solution = solver.solve();

  if (!solution) {
    throw new Error('Failed to resolve dependency graph for given manifest');
  }

  const ids = solution.getTrueVars();
  const graph = ids.map(id => {
    const [name, version] = id.split('@');
    const { registered } = resolver.graph.get(name);
    return registered.find(registration => registration.version === version);
  });

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

function getMatching(dependency: Dependency, resolver: Resolver): string[] {
  const { name, version } = dependency;
  const { registered } = resolver.graph.get(name);

  const matching = registered
    .filter(registration => semver.satisfies(version, registration.version))
    .map(registration => `${name}@${registration.version}`);

  return matching;
}
