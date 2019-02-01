import { Dependency } from '../manifest/types';
import { Registration } from '../sources/types';
import { DependencyGraph } from './types';

export function getRegistration(
  graph: DependencyGraph,
  dependency: Dependency
): Registration | undefined {
  return graph.find(value => value.name === dependency.name);
}
