import { join } from 'path';
import { remove } from 'fs-extra';
import { unzip, walk } from '../../src/utils';
import { TargetType } from '../../src/manifest/target';
import { createTarget } from '../../src/targets';
import { loadConfig } from '../../src/config';

const FIXTURES = join(__dirname, '..', 'fixtures');
const cwd = join(FIXTURES, 'build');
const build = join(cwd, 'build');
const tmp = join(cwd, 'tmp');

afterAll(async () => Promise.all([remove(build), remove(tmp)]));

test('should create target', async () => {
  const config = await loadConfig(cwd);
  const target = {
    name: 'create-target',
    type: <TargetType>'xlsm',
    path: 'targets/xlsm'
  };

  const file = await createTarget(config, target);
  expect(file).toEqual(join(build, 'create-target.xlsm'));
  expect(await walk(build)).toMatchSnapshot();

  await unzip(file, tmp);
  expect(await walk(tmp)).toMatchSnapshot();
});
