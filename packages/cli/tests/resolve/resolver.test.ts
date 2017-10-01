import { loadConfig } from '../../src/config';
import Resolver from '../../src/resolve/resolver';

jest.mock('../../src/sources/registry-source');

const dependency = {
  name: 'a',
  version: '^1.0.0',
  defaultFeatures: true,
  features: []
};

test('should get dependency from clean state', async () => {
  const config = await loadConfig();
  const resolver = new Resolver(config);

  const resolved = await resolver.get(dependency);
  expect(resolved).toMatchSnapshot();
});

test('should get dependency with existing', async () => {
  const config = await loadConfig();
  const resolver = new Resolver(config);

  resolver.graph.set('a', { name: 'a', range: [], registered: [] });

  const resolved = await resolver.get(dependency);
  expect(resolved).toMatchSnapshot();
});

test('should include preferred with resolved', async () => {
  const config = await loadConfig();
  const resolver = new Resolver(config);

  resolver.prefer([
    {
      name: 'a',
      id: 'a@1.0.0',
      source: 'registry+<url>#<none>',
      version: '1.0.0',
      features: [],
      dependencies: [
        {
          name: 'd',
          version: '^1.0.0',
          defaultFeatures: true,
          features: []
        }
      ]
    }
  ]);

  const resolved = await resolver.get(dependency);
  expect(resolved).toMatchSnapshot();
});

test('should get registration', async () => {
  const config = await loadConfig();
  const resolver = new Resolver(config);
  const resolved = await resolver.get(dependency);

  const registration = resolver.getRegistration('a@1.0.0');
  expect(registration).toMatchSnapshot();
});

test('should iterate through graph entries', async () => {
  const config = await loadConfig();
  const resolver = new Resolver(config);
  const resolved = await resolver.get(dependency);

  const graph = [...resolver];
  expect(graph).toMatchSnapshot();
});
