import { RegistryDependency } from '../../src/manifest/dependency';
import Resolver, { Resolution } from '../../src/resolve/resolver';

const registry = {
  a: [
    { name: 'a', version: '0.1.0', dependencies: [] },
    {
      name: 'a',
      version: '1.0.0',
      dependencies: [{ name: 'd', version: '^1.0.0' }]
    },
    {
      name: 'a',
      version: '1.1.0',
      dependencies: [{ name: 'd', version: '^1.2.0' }]
    },
    {
      name: 'a',
      version: '1.2.0',
      dependencies: [{ name: 'd', version: '^2.0.0' }]
    }
  ],
  b: [],
  c: [],
  d: [
    {
      name: 'd',
      version: '1.0.0',
      dependencies: [{ name: 'f', version: '1.0.0' }]
    },
    {
      name: 'd',
      version: '1.1.0',
      dependencies: [{ name: 'f', version: '1.0.0' }]
    },
    {
      name: 'd',
      version: '1.2.0',
      dependencies: [{ name: 'f', version: '1.0.0' }]
    },
    {
      name: 'd',
      version: '2.0.0',
      dependencies: [{ name: 'f', version: '2.0.0' }]
    }
  ],
  e: [],
  f: [
    {
      name: 'f',
      version: '1.0.0',
      dependencies: [{ name: 'g', version: '^1' }]
    },
    {
      name: 'f',
      version: '2.0.0',
      dependencies: [{ name: 'g', version: '^1' }]
    }
  ],
  g: [
    { name: 'g', version: '1.0.0', dependencies: [] },
    { name: 'g', version: '2.0.0', dependencies: [] }
  ]
};

export default class MockResolver extends Resolver {
  async get(dependency: RegistryDependency): Promise<Resolution> {
    const { name } = dependency;
    let resolution = this.graph.get(name);

    if (!resolution) {
      const registered = registry[name];
      resolution = {
        name,
        range: [],
        registered
      };

      this.graph.set(name, resolution);
    }

    resolution.range.push(dependency.version);
    return resolution;
  }
}
