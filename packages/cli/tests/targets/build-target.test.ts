import { join } from 'path';
import { remove } from 'fs-extra';
import { createTarget, buildTarget } from '../../src/targets';
import { Source, Reference } from '../../src/manifest';
import { TargetType } from '../../src/manifest/target';
import { loadConfig } from '../../src/config';

jest.mock('../../src/utils/run');

afterEach(async () => Promise.all([remove(build)]));

const FIXTURES = join(__dirname, '..', 'fixtures');
const cwd = join(FIXTURES, 'build');
const build = join(cwd, 'build');
const backup = join(build, '.backup');
const tmp = join(cwd, 'tmp');

const target = {
  name: 'testing',
  type: <TargetType>'xlsm',
  path: 'targets/xlsm'
};

test('should build target', async () => {
  const config = await loadConfig(cwd);
  const graph: { src: Source[]; references: Reference[] } = {
    src: [],
    references: []
  };

  await createTarget(config, target);
  await buildTarget(config, target, graph);

  const run = require('../../src/utils/run').default;
  const [_config, _application, _addin, command, value] = run.mock.calls[0];
  expect(command).toEqual('import');
  expect(value.src).toBe(graph.src);
  expect(value.references).toBe(graph.references);
});
