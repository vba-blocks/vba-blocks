import resolve from '../';
import { Manifest } from '../../manifest';
import { Workspace } from '../../workspace';
import { getConfig } from '@vba-blocks/helpers';
import * as workspaces from '@vba-blocks/fixtures/workspaces';

test('solves simple tree', async () => {
  const config = getConfig();
  const solution = await resolve(config, workspaces.simple);
  expect(solution).toMatchSnapshot();
});

test('solves complex tree', async () => {
  const config = getConfig();
  const solution = await resolve(config, workspaces.complex);
  expect(solution).toMatchSnapshot();
});

test('solves needs-sat tree', async () => {
  const config = getConfig();
  const solution = await resolve(config, workspaces.needsSat);
  expect(solution).toMatchSnapshot();
});

test('fails to solve unresolvable tree', async () => {
  const config = getConfig();
  await expect(
    resolve(config, workspaces.unresolvable)
  ).rejects.toMatchSnapshot();
});
