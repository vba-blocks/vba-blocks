import resolve from '../';
import { getConfig } from '../../../tests/__helpers__/config';
import { Manifest } from '../../manifest';
import { Workspace } from '../../workspace';
import { toWorkspace } from '../../../tests/__helpers__/workspace';
import * as manifest from '../../../tests/__fixtures__/manifest';

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
