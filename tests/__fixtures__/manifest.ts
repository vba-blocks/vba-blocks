import { join } from 'path';
import {
  Manifest,
  Source,
  Feature,
  Dependency,
  Reference,
  Target
} from '../../../src/manifest';
import { ConfigValue } from '../../../src/config';

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

interface Options {
  name?: string;
  version?: string;
  defaultFeatures?: string[];
  src?: Source[];
  features?: Feature[];
  dependencies?: Dependency[];
  references?: Reference[];
  targets?: Target[];
  dir?: string;
}

function createManifest(options: Options): Manifest {
  const {
    name = 'testing',
    version = '1.0.0',
    defaultFeatures = [],
    src = [],
    features = [],
    dependencies = [],
    references = [],
    targets = [],
    dir = join(__dirname, '../fixtures')
  } = options;

  return {
    name,
    version,
    package: { name, authors: [], publish: false },
    src,
    features,
    defaultFeatures,
    dependencies,
    references,
    targets,
    dir
  };
}

function toDependencies(values: object): Dependency[] {
  const dependencies = [];
  for (const [name, version] of Object.entries(values)) {
    dependencies.push(<Dependency>{
      name,
      version,
      registry: 'vba-blocks'
    });
  }

  return dependencies;
}
