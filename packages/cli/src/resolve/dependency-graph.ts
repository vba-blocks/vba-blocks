import { Registration } from '../sources';
import { Dependency } from '../manifest';

export type DependencyGraph = Registration[];

export function getRegistration(
  graph: DependencyGraph,
  dependency: Dependency
): Registration | undefined {
  return graph.find(value => value.name === dependency.name);
}
