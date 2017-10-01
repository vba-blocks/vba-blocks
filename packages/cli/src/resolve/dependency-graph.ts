import { Config } from '../config';
import SourceManager, { Registration } from '../sources';
import { loadManifest } from '../manifest';
import { parallel } from '../utils';

export type DependencyGraph = Registration[];

export async function fetchDependencies(
  config: Config,
  graph: DependencyGraph
): Promise<void> {
  const manager = new SourceManager(config);

  await parallel(graph, async (registration: Registration) => {
    // (store fetched path and load manifest)
    const path = await manager.fetch(registration);
    registration.path = path;
    registration.manifest = await loadManifest(path);
  });
}
