const features = [];
const source = 'registry+<url>#<none>';
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
          default_features: true
        }
      ]
    },
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

export async function update() {}

export async function resolve(config, dependency) {
  const { name } = dependency;
  return registry[name];
}

export async function fetch(config, registration) {}
