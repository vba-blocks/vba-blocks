import {
  Manifest,
  Source,
  Feature,
  Dependency,
  Reference,
  Target
} from '../../src/manifest';

export interface Options {
  name?: string;
  version?: string;
  default_features?: string[];
  src?: Source[];
  features?: Feature[];
  dependencies?: Dependency[];
  references?: Reference[];
  targets?: Target[];
}

export function createManifest(options: Options): Manifest {
  const {
    name = 'testing',
    version = '1.0.0',
    default_features = [],
    src = [],
    features = [],
    dependencies = [],
    references = [],
    targets = []
  } = options;

  return {
    name,
    version,
    metadata: { authors: [], publish: false, default_features },
    src,
    features,
    dependencies,
    references,
    targets
  };
}
