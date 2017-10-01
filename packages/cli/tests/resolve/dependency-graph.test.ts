import { loadConfig } from '../../src/config';
import { fetchDependencies } from '../../src/resolve/dependency-graph';

test('fetches dependencies', async () => {
  const config = await loadConfig();
  const graph = [];

  await fetchDependencies(config, graph);

  // TODO check graph for path and manifest
});
