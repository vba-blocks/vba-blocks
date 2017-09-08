import { RegistryDependency } from '../../src/manifest/dependency';
import Resolver, { Resolution } from '../../src/resolve/resolver';
import { Registration } from '../../src/sources';

const features = [];
const source = 'registry+<url>#<none>';

const a_1_dependency: RegistryDependency = {
  name: 'd',
  version: '^1.0.0',
  features: [],
  default_features: true
};
const a_1: Registration = {
  id: 'a@1.0.0',
  source,
  name: 'a',
  version: '1.0.0',
  features,
  dependencies: [a_1_dependency]
};

const registry = {
  a: [
    {
      id: 'a@0.1.0',
      name: 'a',
      version: '0.1.0',
      features,
      source,
      dependencies: []
    },
    a_1,
    {
      id: 'a@1.1.0',
      name: 'a',
      version: '1.1.0',
      features,
      source,
      dependencies: [{ name: 'd', version: '^1.2.0' }]
    },
    {
      id: 'a@1.2.0',
      name: 'a',
      version: '1.2.0',
      features,
      source,
      dependencies: [{ name: 'd', version: '^2' }]
    }
  ],
  b: [
    {
      id: 'b@1.0.0',
      name: 'b',
      version: '1.0.0',
      features,
      source,
      dependencies: [{ name: 'c', version: '^0.1.0' }]
    },
    {
      id: 'b@1.1.0',
      name: 'b',
      version: '1.1.0',
      features,
      source,
      dependencies: [{ name: 'c', version: '^0.1.5' }]
    }
  ],
  c: [
    {
      id: 'c@0.1.0',
      name: 'c',
      version: '0.1.0',
      features,
      source,
      dependencies: []
    },
    {
      id: 'c@0.1.6',
      name: 'c',
      version: '0.1.6',
      features,
      source,
      dependencies: []
    }
  ],
  d: [
    {
      id: 'd@1.0.0',
      name: 'd',
      version: '1.0.0',
      features,
      source,
      dependencies: [{ name: 'f', version: '^1' }]
    },
    {
      id: 'd@1.1.0',
      name: 'd',
      version: '1.1.0',
      features,
      source,
      dependencies: [{ name: 'f', version: '^1' }]
    },
    {
      id: 'd@1.2.0',
      name: 'd',
      version: '1.2.0',
      features,
      source,
      dependencies: [{ name: 'f', version: '^1' }]
    },
    {
      id: 'd@2.0.0',
      name: 'd',
      version: '2.0.0',
      features,
      source,
      dependencies: [{ name: 'f', version: '^2' }]
    }
  ],
  e: [],
  f: [
    {
      id: 'f@1.0.0',
      name: 'f',
      version: '1.0.0',
      features,
      source,
      dependencies: [{ name: 'g', version: '^1' }]
    },
    {
      id: 'f@2.0.0',
      name: 'f',
      version: '2.0.0',
      features,
      source,
      dependencies: [{ name: 'g', version: '^1' }]
    }
  ],
  g: [
    {
      id: 'g@1.0.0',
      name: 'g',
      version: '1.0.0',
      features,
      source,
      dependencies: []
    },
    {
      id: 'g@2.0.0',
      name: 'g',
      version: '2.0.0',
      features,
      source,
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
