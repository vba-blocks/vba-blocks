import { resolveProject } from '@vba-blocks/helpers';
import { complex as project } from '@vba-blocks/fixtures/projects';
import { loadBuildGraph } from '../build-graph';
import { fetchDependencies } from '../../project';

test('should create build graph', async () => {
  const resolved = await resolveProject(project);
  const dependencies = await fetchDependencies(resolved);

  const graph = await loadBuildGraph(resolved, dependencies);
  expect(graph).toMatchSnapshot();
});
