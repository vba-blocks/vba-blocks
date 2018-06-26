import solve from '../latest-solver';
import Resolver from '../resolver';
import { setupWorkspace, reset } from '../../../tests/__helpers__/project';
import { standard, needsSat, unresolvable } from '../../../tests/__fixtures__';

afterEach(reset);

test('solves standard tree', async () => {
  const { config, workspace } = await setupWorkspace(standard);
  const resolver = new Resolver(config);

  const solution = await solve(workspace, resolver);
  expect(solution).toMatchSnapshot();
});

test('fails to solve needs-sat tree', async () => {
  const { config, workspace } = await setupWorkspace(needsSat);
  const resolver = new Resolver(config);

  await expect(solve(workspace, resolver)).rejects.toMatchSnapshot();
});

test('fails to solve unresolvable tree', async () => {
  const { config, workspace } = await setupWorkspace(unresolvable);
  const resolver = new Resolver(config);

  await expect(solve(workspace, resolver)).rejects.toMatchSnapshot();
});
