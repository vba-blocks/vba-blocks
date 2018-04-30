import env from '../../env';
import { createBuildGraph } from '../build-graph';
import { tmpFolder, unixJoin } from '../../utils';
import { resolveProject } from '@vba-blocks/helpers';
import { simple as project } from '@vba-blocks/fixtures/projects';

import stageBuildGraph from '../stage-build-graph';

test('should stage build graph for Mac', async () => {
  env.isWindows = false;
  env.staging = await tmpFolder();

  const resolved = await resolveProject(project);
  const graph = await createBuildGraph(resolved, {});
  const staged = await stageBuildGraph(graph);

  expect(staged.src.length).toEqual(4);
  expect(staged.src[0].path).toEqual(unixJoin(env.staging, 'a.bas'));
  expect(staged.src[0].original).toMatch(/__fixtures__\/sources\/a\/a\.bas/);
});
