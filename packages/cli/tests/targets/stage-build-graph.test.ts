import { join } from 'path';
import { toProject } from '../helpers/project';
import { simple as manifest } from '../fixtures/manifest';
import env from '../../src/env';
import { createBuildGraph } from '../../src/targets/build-graph';
import { tmpFolder } from '../../src/utils';

import stageBuildGraph from '../../src/targets/stage-build-graph';

test('should stage build graph for Mac', async () => {
  env.isWindows = false;
  env.staging = await tmpFolder();

  const project = await toProject(manifest);
  const graph = await createBuildGraph(project, {});

  const staged = await stageBuildGraph(graph);

  expect(staged.src.length).toEqual(4);
  expect(staged.src[0].path).toEqual(join(env.staging, 'a.bas'));
});
