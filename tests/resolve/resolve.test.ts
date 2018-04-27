import resolve from '../../src/resolve';
import { getConfig } from '../helpers/config';
import { Manifest } from '../../src/manifest';
import { Workspace } from '../../src/workspace';
import { toWorkspace } from '../helpers/workspace';
import * as manifest from '../fixtures/manifest';

test('solves simple tree', async () => {
  const config = getConfig();
  const solution = await resolve(config, toWorkspace(manifest.simple));
  expect(solution).toMatchSnapshot();
});

test('solves complex tree', async () => {
  const config = getConfig();
  const solution = await resolve(config, toWorkspace(manifest.complex));
  expect(solution).toMatchSnapshot();
});

test('solves needs-sat tree', async () => {
  const config = getConfig();
  const solution = await resolve(config, toWorkspace(manifest.needsSat));
  expect(solution).toMatchSnapshot();
});

test('fails to solve unresolvable tree', async () => {
  const config = getConfig();
  await expect(
    resolve(config, toWorkspace(manifest.unresolvable))
  ).rejects.toMatchSnapshot();
});
