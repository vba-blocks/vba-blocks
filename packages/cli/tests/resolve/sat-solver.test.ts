import solve from '../../src/resolve/sat-solver';
import { loadConfig } from '../../src/config';
import { RegistryDependency } from '../../src/manifest/dependency';
import MockResolver from '../helpers/resolver';

test('solves simple tree', async () => {
  const config = await loadConfig();

  const dependency: RegistryDependency = {
    name: 'a',
    default_features: true,
    features: [],
    optional: false,
    version: '^1.0.0'
  };

  const manifest = {
    metadata: {
      name: 'sat-solver',
      version: '1.0.0',
      authors: ['Tim Hall'],
      publish: false,
      default_features: []
    },
    src: [],
    features: [],
    dependencies: [dependency],
    references: [],
    targets: []
  };
  const resolver = new MockResolver(config);

  const solution = await solve(config, manifest, resolver);

  expect(solution).toMatchSnapshot();
});
