import { toProject } from '../../../tests/__helpers__/project';
import { simple as manifest } from '../../../tests/__fixtures__/manifest';
import env from '../../env';
import { createBuildGraph } from '../build-graph';
import { tmpFolder, unixJoin } from '../../utils';

import stageBuildGraph from '../stage-build-graph';

test('should stage build graph for Mac', async () => {
  env.isWindows = false;
  env.staging = await tmpFolder();

  const project = await toProject(manifest);
  const graph = await createBuildGraph(project, {});

  const staged = await stageBuildGraph(graph);

  expect(staged.src.length).toEqual(4);
  expect(staged.src[0].path).toEqual(unixJoin(env.staging, 'a.bas'));
  expect(staged.src[0].original).toMatch(/__fixtures__\/sources\/a\/a\.bas/);
});
