import { Config } from '../config';
import SourceManager, { Registration } from '../sources';
import { Manifest, Dependency, loadManifest } from '../manifest';
import { parallel } from '../utils';

export type DependencyGraph = Registration[];

export function getRegistration(
  graph: DependencyGraph,
  dependency: Dependency
) {
  return graph.find(value => value.name === dependency.name);
}
