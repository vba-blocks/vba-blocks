import { standardExport } from '../../../tests/__fixtures__';
import { setupEnvironment, reset } from '../../../tests/__helpers__/project';
import { normalizeBuildGraph } from './load-from-project.test';
import loadFromExport from '../load-from-export';

afterAll(reset);

test('should load BuildGraph from exported project', async () => {
  setupEnvironment(standardExport);

  const graph = await loadFromExport(standardExport);
  expect(normalizeBuildGraph(graph)).toMatchSnapshot();
});
