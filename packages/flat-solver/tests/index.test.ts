import { solve } from '../src/index';
import resolver from './helpers/resolver';

test('solves simple tree', async () => {
  const simple = {
    a: '^1.0.0'
  };
  const solution = await solve(simple, resolver);

  expect(solution.success).toEqual(true);
  expect(solution.result).toMatchSnapshot();
});
