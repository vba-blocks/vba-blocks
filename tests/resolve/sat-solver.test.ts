import solve from '../../src/resolve/sat-solver';
import { getConfig } from '../helpers/config';
import Resolver from '../../src/resolve/resolver';
import { toWorkspace } from '../helpers/workspace';
import * as manifest from '../fixtures/manifest';

test('solves simple tree', async () => {
  const config = getConfig();
  const resolver = new Resolver(config);

  const solution = await solve(toWorkspace(manifest.simple), resolver);

  expect(solution).toMatchSnapshot();
});

test('solves complex tree', async () => {
  const config = getConfig();
  const resolver = new Resolver(config);

  const solution = await solve(toWorkspace(manifest.complex), resolver);

  expect(solution).toMatchSnapshot();
});

test('solves needs-sat tree', async () => {
  const config = getConfig();
  const resolver = new Resolver(config);

  const solution = await solve(toWorkspace(manifest.needsSat), resolver);

  expect(solution).toMatchSnapshot();
});

test('fails to solve unresolvable tree', async () => {
  const config = getConfig();
  const resolver = new Resolver(config);

  await expect(
    solve(toWorkspace(manifest.unresolvable), resolver)
  ).rejects.toMatchSnapshot();
});
