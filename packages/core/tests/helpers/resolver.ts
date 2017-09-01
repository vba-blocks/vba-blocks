import { PackageInfo } from '../../src/index';

const registry = {
  a: [
    { name: 'a', version: '0.1.0', dependencies: {} },
    { name: 'a', version: '1.0.0', dependencies: { d: '^1.0.0' } },
    { name: 'a', version: '1.1.0', dependencies: { d: '^1.2.0' } },
    { name: 'a', version: '1.2.0', dependencies: { d: '^2.0.0' } }
  ],
  b: [],
  c: [],
  d: [
    { name: 'd', version: '1.0.0', dependencies: { f: '1.0.0' } },
    { name: 'd', version: '1.1.0', dependencies: { f: '1.0.0' } },
    { name: 'd', version: '1.2.0', dependencies: { f: '1.0.0' } },
    { name: 'd', version: '2.0.0', dependencies: { f: '2.0.0' } }
  ],
  e: [],
  f: [
    { name: 'f', version: '1.0.0', dependencies: { g: '^1' } },
    { name: 'f', version: '2.0.0', dependencies: { g: '^1' } }
  ],
  g: [
    { name: 'g', version: '1.0.0', dependencies: [] },
    { name: 'g', version: '2.0.0', dependencies: [] }
  ]
};

export default async function resolver(name: string): Promise<PackageInfo[]> {
  const versions = registry[name] || [];

  return versions.map(info => {
    const dependencies = [];
    for (const [name, version] of Object.entries(info.dependencies)) {
      dependencies.push({ name, version });
    }

    return Object.assign({}, info, { dependencies });
  });
}
