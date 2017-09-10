import solve from '../../src/resolve/latest-solver';
import { loadConfig } from '../../src/config';
import Resolver from '../../src/resolve/resolver';
import * as manifest from '../fixtures/manifest';

jest.mock('../../src/sources/registry-source');

test('solves simple tree', async () => {
  const config = await loadConfig();
  const resolver = new Resolver(config);

  const solution = await solve(config, manifest.simple, resolver);

  expect(solution).toMatchSnapshot();
});

test('solves complex tree', async () => {
  const config = await loadConfig();
  const resolver = new Resolver(config);

  const solution = await solve(config, manifest.complex, resolver);

  expect(solution).toMatchSnapshot();
});

test('fails to solve needs-sat tree', async () => {
  const config = await loadConfig();
  const resolver = new Resolver(config);

  await expect(() => solve(config, manifest.needsSat, resolver)).rejects;
});

test('fails to solve unresolvable tree', async () => {
  const config = await loadConfig();
  const resolver = new Resolver(config);

  await expect(() => solve(config, manifest.unresolvable, resolver)).rejects;
});
