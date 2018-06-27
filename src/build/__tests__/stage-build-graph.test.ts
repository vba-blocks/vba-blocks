import { setup, reset } from '../../../tests/__helpers__/project';
import { standard, standardImport } from '../../../tests/__fixtures__';
import { pathExists } from '../../utils/fs';
import loadFromProject from '../load-from-project';
import stageBuildGraph from '../stage-build-graph';

afterEach(reset);

test('should stage BuildGraph', async () => {
  expect.assertions(10);

  const { project, dependencies } = await setup(standard);
  const graph = await loadFromProject(project, dependencies);

  const import_graph = await stageBuildGraph(graph, standardImport);
  expect(import_graph).toMatchSnapshot();

  for (const source of import_graph.components) {
    expect(await pathExists(source.path)).toEqual(true);
  }
});
