import { cache } from '../../../tests/__fixtures__';
import { loadConfig } from '../../config';
import env from '../../env';
import { join } from '../../utils/path';
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
  name: 'vba-tools/json',
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

  resolver.graph.set('vba-tools/json', { name: 'vba-tools/json', range: [], registered: [] });

  const resolved = await resolver.get(dependency);
  expect(resolved).toMatchSnapshot();
});

test('should include preferred with resolved', async () => {
  const config = await loadConfig();
  const resolver = new Resolver(config);

  resolver.prefer([
    {
      name: 'vba-tools/json',
      id: 'vba-tools/json@2.0.1',
      source: 'registry+vba-blocks#<hash>',
      version: '2.0.1',
      dependencies: [
        {
          name: 'vba-tools/dictionary',
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

  const registration = resolver.getRegistration('vba-tools/json@2.0.1');
  expect(registration).toMatchSnapshot();
});

test('should iterate through graph entries', async () => {
  const config = await loadConfig();
  const resolver = new Resolver(config);

  await resolver.get(dependency);

  const graph = [...resolver];
  expect(graph).toMatchSnapshot();
});
