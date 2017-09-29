import resolve from '../../src/resolve';
import { loadConfig } from '../../src/config';
import { toWorkspace } from '../helpers/workspace';
import * as manifest from '../fixtures/manifest';

jest.mock('../../src/sources/registry-source');

test('solves simple tree', async () => {
  const config = await loadConfig();
  const solution = await resolve(config, toWorkspace(manifest.simple));
  expect(solution).toMatchSnapshot();
});

test('solves complex tree', async () => {
  const config = await loadConfig();
  const solution = await resolve(config, toWorkspace(manifest.complex));
  expect(solution).toMatchSnapshot();
});

test('solves needs-sat tree', async () => {
  const config = await loadConfig();
  const solution = await resolve(config, toWorkspace(manifest.needsSat));
  expect(solution).toMatchSnapshot();
});

test('fails to solve unresolvable tree', async () => {
  const config = await loadConfig();
  await expect(() => resolve(config, toWorkspace(manifest.unresolvable)))
    .rejects;
});
