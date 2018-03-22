import { toProject } from '../helpers/project';
import { complex as manifest } from '../fixtures/manifest';

import { createBuildGraph } from '../../src/targets/build-graph';

test('should create build graph', async () => {
  const project = await toProject(manifest);
  const graph = await createBuildGraph(project, {});

  expect(graph).toMatchSnapshot();
});
