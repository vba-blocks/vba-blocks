import env from '../../env';
import { loadBuildGraph } from '../build-graph';
import { resolveProject, prepareStaging } from '../../../tests/__helpers__';
import { simple as project } from '../../../tests/__fixtures__/projects';

import { stageBuildGraph, ImportGraph } from '../stage-build-graph';
import { fetchDependencies } from '../../project';

test('should stage build graph for Mac', async () => {
  env.isWindows = false;

  const resolved = await resolveProject(project);
  const prepared = await prepareStaging(resolved);
  const staging = prepared.paths.staging;
  const dependencies = await fetchDependencies(prepared);

  const graph = await loadBuildGraph(prepared, dependencies);
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
