import {
  DependencyGraph,
  getRegistration
} from '../../src/resolve/dependency-graph';

test('gets registration for dependency', async () => {
  const a = {
    id: 'a@1.0.0',
    name: 'a',
    version: '1.0.0',
    source: 'registry+<url>',
    features: [],
    dependencies: []
  };
  const graph: DependencyGraph = [a];

  expect(
    getRegistration(graph, {
      name: 'a',
      version: '^1.0.0',
      defaultFeatures: true,
      features: []
    })
  ).toEqual(a);
  expect(
    getRegistration(graph, {
      name: 'b',
      version: '^1.0.0',
      defaultFeatures: true,
      features: []
    })
  ).toBeUndefined();
});
