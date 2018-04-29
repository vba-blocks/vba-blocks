import { toProject } from '../../../tests/__helpers__/project';
import { complex as manifest } from '../../../tests/__fixtures__/manifest';

import { createBuildGraph } from '../build-graph';

test('should create build graph', async () => {
  const project = await toProject(manifest);
  const graph = await createBuildGraph(project, {});

  expect(graph).toMatchSnapshot();
});
