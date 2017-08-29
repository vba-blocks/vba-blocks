import * as semver from 'semver';
import { Version, Dependency, PackageInfo, Resolver } from './';
import { forEach, unique } from './utils';

export type FlatGraph = Map<string, FlatGraphNode>;
export type FlatGraphNode = {
  name: string;
  needs: Version[];
  versions: PackageInfo[];
  required?: boolean;
};

export async function resolveDependencies(
  dependencies: Dependency[],
  resolver: Resolver,
  graph?: FlatGraph
): Promise<FlatGraph> {
  // For top-level dependencies, mark as required
  const required = !graph;
  if (!graph) graph = new Map();

  for (const dependency of dependencies) {
    const { name, version } = dependency;
    if (!graph.has(name)) {
      const versions = await resolver(name);
      const node: FlatGraphNode = {
        name,
        needs: [],
        versions,
        required
      };

      graph.set(name, node);

      for (const version of versions) {
        await resolveDependencies(version.dependencies, resolver, graph);
      }
    }

    graph.get(name).needs.push(version);
  }

  if (required) {
    // Optimize graph by filtering out unneeded versions
    forEach(graph.values(), (node: FlatGraphNode) => {
      const { name, versions } = node;
      const needs: string[] = unique(node.needs);
      const range = needs.join(' || ');

      node.needs = needs;
      node.versions = versions
        .filter(({ version }) => semver.satisfies(version, range))
        .map(info => Object.assign({ id: `${name}@${info.version}` }, info))
        .reverse();
    });
  }

  return graph;
}
