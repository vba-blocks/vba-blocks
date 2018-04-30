import env from '../../env';
import { createBuildGraph } from '../build-graph';
import { unixJoin } from '../../utils';
import { resolveProject, prepareStaging } from '@vba-blocks/helpers';
import { simple as project } from '@vba-blocks/fixtures/projects';

import stageBuildGraph from '../stage-build-graph';

test('should stage build graph for Mac', async () => {
  env.isWindows = false;

  const resolved = await resolveProject(project);
  const prepared = await prepareStaging(resolved);

  const graph = await createBuildGraph(prepared, {});
  const { staged, graph: staged_graph } = await stageBuildGraph(
    prepared,
    graph
  );

  expect(staged_graph.src.length).toEqual(4);
  expect(staged_graph.src[0].path).toEqual(
    unixJoin(prepared.paths.staging, 'import', 'a.bas')
  );
  expect(staged_graph.src[0].original).toMatch(
    /__fixtures__\/sources\/a\/a\.bas/
  );
});
