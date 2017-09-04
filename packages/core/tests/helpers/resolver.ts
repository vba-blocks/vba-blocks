import { RegistryDependency } from '../../src/manifest/dependency';
import Resolver, { Resolution } from '../../src/resolve/resolver';
import { Registration } from '../../src/manager';

const a_1_dependency: RegistryDependency = {
  name: 'd',
  version: '^1.0.0',
  features: [],
  default_features: true
};
const a_1: Registration = {
  name: 'a',
  version: '1.0.0',
  features: {},
  source: '<registry>',
  checksum: '<none>',
  dependencies: [a_1_dependency]
};

const registry = {
  a: [
    {
      name: 'a',
      version: '0.1.0',
      features: {},
      source: '<registry>',
      checksum: '<none>',
      dependencies: []
    },
    a_1,
    {
      name: 'a',
      version: '1.1.0',
      features: {},
      source: '<registry>',
      checksum: '<none>',
      dependencies: [{ name: 'd', version: '^1.2.0' }]
    },
    {
      name: 'a',
      version: '1.2.0',
      features: {},
      source: '<registry>',
      checksum: '<none>',
      dependencies: [{ name: 'd', version: '^2.0.0' }]
    }
  ],
  b: [],
  c: [],
  d: [
    {
      name: 'd',
      version: '1.0.0',
      features: {},
      source: '<registry>',
      checksum: '<none>',
      dependencies: [{ name: 'f', version: '1.0.0' }]
    },
    {
      name: 'd',
      version: '1.1.0',
      features: {},
      source: '<registry>',
      checksum: '<none>',
      dependencies: [{ name: 'f', version: '1.0.0' }]
    },
    {
      name: 'd',
      version: '1.2.0',
      features: {},
      source: '<registry>',
      checksum: '<none>',
      dependencies: [{ name: 'f', version: '1.0.0' }]
    },
    {
      name: 'd',
      version: '2.0.0',
      features: {},
      source: '<registry>',
      checksum: '<none>',
      dependencies: [{ name: 'f', version: '2.0.0' }]
    }
  ],
  e: [],
  f: [
    {
      name: 'f',
      version: '1.0.0',
      features: {},
      source: '<registry>',
      checksum: '<none>',
      dependencies: [{ name: 'g', version: '^1' }]
    },
    {
      name: 'f',
      version: '2.0.0',
      features: {},
      source: '<registry>',
      checksum: '<none>',
      dependencies: [{ name: 'g', version: '^1' }]
    }
  ],
  g: [
    {
      name: 'g',
      version: '1.0.0',
      features: {},
      source: '<registry>',
      checksum: '<none>',
      dependencies: []
    },
    {
      name: 'g',
      version: '2.0.0',
      features: {},
      source: '<registry>',
      checksum: '<none>',
      dependencies: []
    }
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
