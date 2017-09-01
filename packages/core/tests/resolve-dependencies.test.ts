import { resolveDependencies } from '../src/flat-solver/resolve-dependencies';
import resolver from './helpers/resolver';

test('resolves simple dependency tree', async () => {
  const dependencies = [{ name: 'a', version: '^1.0.0' }];
  const flatGraph = await resolveDependencies(dependencies, resolver);

  expect(flatGraph).toMatchSnapshot();
});
