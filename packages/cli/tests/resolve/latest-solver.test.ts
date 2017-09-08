import solve from '../../src/resolve/latest-solver';
import { loadConfig } from '../../src/config';
import { RegistryDependency } from '../../src/manifest/dependency';
import MockResolver from '../helpers/resolver';
import { simple } from '../fixtures/manifest';

test('solves simple tree', async () => {
  const config = await loadConfig();
  const resolver = new MockResolver(config);

  const solution = await solve(config, simple, resolver);

  expect(solution).toMatchSnapshot();
});
