import { loadBuildGraph } from '../build-graph';
import { setup, reset } from '../../../tests/__helpers__/project';
import { standard } from '../../../tests/__fixtures__';

import { stageBuildGraph, ImportGraph } from '../stage-build-graph';

afterEach(reset);

test('should stage build graph', async () => {
  const { project, dependencies } = await setup(standard);
  const staging = project.paths.staging;

  const graph = await loadBuildGraph(project, dependencies);
  const import_graph = await stageBuildGraph(graph, staging);

  expect(normalizeGraph(import_graph, staging)).toMatchSnapshot();
});

function normalizeGraph(graph: ImportGraph, staging: string): ImportGraph {
  const { name, components, references } = graph;

  return {
    name,
    components: components.map(component => {
      const { name, path } = component;
      return { name, path: path.replace(staging, 'staging') };
    }),
    references
  };
}
