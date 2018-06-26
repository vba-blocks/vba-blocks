import env from '../../env';
import { loadConfig } from '../../config';
import { join } from '../../utils/path';
import { cache } from '../../../tests/__fixtures__';

import Resolver from '../resolver';

jest.mock('../../utils/git');

const original_env = { ...env };

beforeEach(() => {
  env.cache = cache;
  env.registry = join(cache, 'registry');
  env.packages = join(cache, 'packages');
  env.sources = join(cache, 'sources');
});

afterEach(() => {
  env.cache = original_env.cache;
  env.registry = original_env.registry;
  env.packages = original_env.packages;
  env.sources = original_env.sources;
});

const dependency = {
  name: 'json',
  version: '^2',
  registry: 'vba-blocks'
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

  resolver.graph.set('json', { name: 'json', range: [], registered: [] });

  const resolved = await resolver.get(dependency);
  expect(resolved).toMatchSnapshot();
});

test('should include preferred with resolved', async () => {
  const config = await loadConfig();
  const resolver = new Resolver(config);

  resolver.prefer([
    {
      name: 'json',
      id: 'json@2.0.1',
      source: 'registry+vba-blocks#<hash>',
      version: '2.0.1',
      dependencies: [
        {
          name: 'dictionary',
          version: '^1',
          registry: 'vba-blocks'
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

  await resolver.get(dependency);

  const registration = resolver.getRegistration('json@2.0.1');
  expect(registration).toMatchSnapshot();
});

test('should iterate through graph entries', async () => {
  const config = await loadConfig();
  const resolver = new Resolver(config);

  await resolver.get(dependency);

  const graph = [...resolver];
  expect(graph).toMatchSnapshot();
});
