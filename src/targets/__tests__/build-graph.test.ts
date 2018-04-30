import { resolveProject } from '@vba-blocks/helpers';
import { complex as project } from '@vba-blocks/fixtures/projects';
import { createBuildGraph } from '../build-graph';

test('should create build graph', async () => {
  const resolved = await resolveProject(project);
  const graph = await createBuildGraph(resolved, {});
  expect(graph).toMatchSnapshot();
});
