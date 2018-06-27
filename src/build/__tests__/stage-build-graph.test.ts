import { setup, reset } from '../../../tests/__helpers__/project';
import { dir, complex, standardImport } from '../../../tests/__fixtures__';
import { relative } from '../../utils/path';
import { pathExists } from '../../utils/fs';
import loadFromProject from '../load-from-project';
import stageBuildGraph, { ImportGraph } from '../stage-build-graph';

afterEach(reset);

test('should stage BuildGraph', async () => {
  expect.assertions(15);

  const { project, dependencies } = await setup(complex);
  const graph = await loadFromProject(project, dependencies);

  const import_graph = await stageBuildGraph(graph, standardImport);
  expect(normalizeImportGraph(import_graph)).toMatchSnapshot();

  for (const source of import_graph.components) {
    expect(await pathExists(source.path)).toEqual(true);
  }
});

function normalizeImportGraph(graph: ImportGraph): ImportGraph {
  const { name, references } = graph;
  const components = graph.components.map(source => {
    return {
      name: source.name,
      path: relative(dir, source.path)
    };
  });

  return { name, components, references };
}
