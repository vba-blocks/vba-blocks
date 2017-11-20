import { Feature, Dependency } from '../../src/manifest';
import { Source, Registration } from '../../src/sources';

const source = 'registry+vba-blocks#<hash>';
const registry: { [name: string]: Registration[] } = {
  a: [
    {
      id: 'a@0.1.0',
      name: 'a',
      version: '0.1.0',
      source,
      dependencies: []
    },
    {
      id: 'a@1.0.0',
      source,
      name: 'a',
      version: '1.0.0',
      dependencies: [
        {
          name: 'd',
          version: '^1.0.0',
          registry: 'vba-blocks'
        }
      ]
    },
    {
      id: 'a@1.1.0',
      name: 'a',
      version: '1.1.0',
      source,
      dependencies: [{ name: 'd', version: '^1.2.0', registry: 'vba-blocks' }]
    },
    {
      id: 'a@1.2.0',
      name: 'a',
      version: '1.2.0',
      source,
      dependencies: [{ name: 'd', version: '^2', registry: 'vba-blocks' }]
    }
  ],
  b: [
    {
      id: 'b@1.0.0',
      name: 'b',
      version: '1.0.0',
      source,
      dependencies: [{ name: 'c', version: '^0.1.0', registry: 'vba-blocks' }]
    },
    {
      id: 'b@1.1.0',
      name: 'b',
      version: '1.1.0',
      source,
      dependencies: [{ name: 'c', version: '^0.1.5', registry: 'vba-blocks' }]
    }
  ],
  c: [
    {
      id: 'c@0.1.0',
      name: 'c',
      version: '0.1.0',
      source,
      dependencies: []
    },
    {
      id: 'c@0.1.6',
      name: 'c',
      version: '0.1.6',
      source,
      dependencies: []
    }
  ],
  d: [
    {
      id: 'd@1.0.0',
      name: 'd',
      version: '1.0.0',
      source,
      dependencies: [{ name: 'f', version: '^1', registry: 'vba-blocks' }]
    },
    {
      id: 'd@1.1.0',
      name: 'd',
      version: '1.1.0',
      source,
      dependencies: [{ name: 'f', version: '^1', registry: 'vba-blocks' }]
    },
    {
      id: 'd@1.2.0',
      name: 'd',
      version: '1.2.0',
      source,
      dependencies: [{ name: 'f', version: '^1', registry: 'vba-blocks' }]
    },
    {
      id: 'd@2.0.0',
      name: 'd',
      version: '2.0.0',
      source,
      dependencies: [{ name: 'f', version: '^2', registry: 'vba-blocks' }]
    }
  ],
  e: [],
  f: [
    {
      id: 'f@1.0.0',
      name: 'f',
      version: '1.0.0',
      source,
      dependencies: [{ name: 'g', version: '^1', registry: 'vba-blocks' }]
    },
    {
      id: 'f@2.0.0',
      name: 'f',
      version: '2.0.0',
      source,
      dependencies: [{ name: 'g', version: '^1', registry: 'vba-blocks' }]
    }
  ],
  g: [
    {
      id: 'g@1.0.0',
      name: 'g',
      version: '1.0.0',
      source,
      dependencies: []
    },
    {
      id: 'g@2.0.0',
      name: 'g',
      version: '2.0.0',
      source,
      dependencies: []
    }
  ]
};

export default class RegistrySource {
  resolve(dependency: Dependency) {
    const { name } = dependency;
    return registry[name];
  }

  fetch(registration: Registration) {
    return '';
  }
}
