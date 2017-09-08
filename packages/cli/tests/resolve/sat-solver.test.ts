import solve from '../../src/resolve/sat-solver';
import { loadConfig } from '../../src/config';
import { RegistryDependency } from '../../src/manifest/dependency';
import MockResolver from '../helpers/resolver';
import * as manifest from '../fixtures/manifest';

test('solves simple tree', async () => {
  const config = await loadConfig();
  const resolver = new MockResolver(config);

  const solution = await solve(config, manifest.simple, resolver);

  expect(solution).toMatchSnapshot();
});

test('solves complex tree', async () => {
  const config = await loadConfig();
  const resolver = new MockResolver(config);

  const solution = await solve(config, manifest.complex, resolver);

  expect(solution).toMatchSnapshot();
});

test('solves needs-sat tree', async () => {
  const config = await loadConfig();
  const resolver = new MockResolver(config);

  const solution = await solve(config, manifest.needsSat, resolver);

  expect(solution).toMatchSnapshot();
});

test('fails to solve unresolvable tree', async () => {
  const config = await loadConfig();
  const resolver = new MockResolver(config);

  await expect(() => solve(config, manifest.unresolvable, resolver)).rejects;
});
