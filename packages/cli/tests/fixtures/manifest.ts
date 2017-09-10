import { RegistryDependency } from '../../src/manifest/dependency';
import { createManifest } from '../helpers/manifest';

export const simple = createManifest({
  name: 'simple-manifest',
  dependencies: toDependencies({
    a: '^1.0.0'
  })
});

export const complex = createManifest({
  name: 'complex-manifest',
  dependencies: toDependencies({
    a: '^1',
    b: '^1.0'
  })
});

export const needsSat = createManifest({
  name: 'needs-sat-manifest',
  dependencies: toDependencies({
    a: '^1',
    b: '^1',
    c: '0.1.0',
    d: '^1'
  })
});

export const unresolvable = createManifest({
  name: 'unresolvable-manifest',
  dependencies: toDependencies({
    a: '^1',
    b: '^1.1.0',
    c: '0.1.0'
  })
});

function toDependencies(values: object): RegistryDependency[] {
  const dependencies = [];
  for (const [name, version] of Object.entries(values)) {
    dependencies.push(<RegistryDependency>{
      name,
      version,
      default_features: true,
      features: [],
      optional: false
    });
  }

  return dependencies;
}
