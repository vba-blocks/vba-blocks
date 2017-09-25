import { Config } from '../../config';
import { Feature, Dependency } from '../../manifest';
import { Registration } from '../';
import { Source } from '../source';

const features: Feature[] = [];
const source = 'registry+<url>#<none>';
const registry: { [name: string]: Registration[] } = {
  a: [
    {
      id: 'a@0.1.0',
      name: 'a',
      version: '0.1.0',
      features,
      source,
      dependencies: []
    },
    {
      id: 'a@1.0.0',
      source,
      name: 'a',
      version: '1.0.0',
      features,
      dependencies: [
        {
          name: 'd',
          version: '^1.0.0',
          features: [],
          defaultFeatures: true
        }
      ]
    },
    {
      id: 'a@1.1.0',
      name: 'a',
      version: '1.1.0',
      features,
      source,
      dependencies: [
        { name: 'd', version: '^1.2.0', features: [], defaultFeatures: true }
      ]
    },
    {
      id: 'a@1.2.0',
      name: 'a',
      version: '1.2.0',
      features,
      source,
      dependencies: [
        { name: 'd', version: '^2', features: [], defaultFeatures: true }
      ]
    }
  ],
  b: [
    {
      id: 'b@1.0.0',
      name: 'b',
      version: '1.0.0',
      features,
      source,
      dependencies: [
        { name: 'c', version: '^0.1.0', features: [], defaultFeatures: true }
      ]
    },
    {
      id: 'b@1.1.0',
      name: 'b',
      version: '1.1.0',
      features,
      source,
      dependencies: [
        { name: 'c', version: '^0.1.5', features: [], defaultFeatures: true }
      ]
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
      dependencies: [
        { name: 'f', version: '^1', features: [], defaultFeatures: true }
      ]
    },
    {
      id: 'd@1.1.0',
      name: 'd',
      version: '1.1.0',
      features,
      source,
      dependencies: [
        { name: 'f', version: '^1', features: [], defaultFeatures: true }
      ]
    },
    {
      id: 'd@1.2.0',
      name: 'd',
      version: '1.2.0',
      features,
      source,
      dependencies: [
        { name: 'f', version: '^1', features: [], defaultFeatures: true }
      ]
    },
    {
      id: 'd@2.0.0',
      name: 'd',
      version: '2.0.0',
      features,
      source,
      dependencies: [
        { name: 'f', version: '^2', features: [], defaultFeatures: true }
      ]
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
      dependencies: [
        { name: 'g', version: '^1', features: [], defaultFeatures: true }
      ]
    },
    {
      id: 'f@2.0.0',
      name: 'f',
      version: '2.0.0',
      features,
      source,
      dependencies: [
        { name: 'g', version: '^1', features: [], defaultFeatures: true }
      ]
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

const mock: Source = {
  match(type) {
    return true;
  },
  resolve(config, dependency) {
    const { name } = dependency;
    return registry[name];
  },
  fetch(config, registration) {
    return '';
  }
};
export default mock;
