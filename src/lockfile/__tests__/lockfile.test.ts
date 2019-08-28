import { toToml } from '../';
import { dev } from '../../../tests/__fixtures__';
import { setup } from '../../../tests/__helpers__/project';
import { normalizeLockfile } from '../__helpers__/lockfile';

test('loads and parses manifest', async () => {
  const { project } = await setup(dev);

  const toml = toToml(project, dev);

  expect(normalizeLockfile(toml)).toMatchSnapshot();
});
