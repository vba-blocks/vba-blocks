import solve from '../sat-solver';
import { getConfig } from '../../../tests/__helpers__/config';
import Resolver from '../resolver';
import { toWorkspace } from '../../../tests/__helpers__/workspace';
import * as manifest from '../../../tests/__fixtures__/manifest';

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
