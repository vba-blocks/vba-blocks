import { join } from 'path';
import {
  Manifest,
  Source,
  Feature,
  Dependency,
  Reference,
  Target
} from '../../src/manifest';
import { ConfigValue } from '../../src/config';

export interface Options {
  name?: string;
  version?: string;
  defaultFeatures?: string[];
  src?: Source[];
  features?: Feature[];
  dependencies?: Dependency[];
  references?: Reference[];
  targets?: Target[];
  config?: ConfigValue;
  dir?: string;
}

export function createManifest(options: Options): Manifest {
  const {
    name = 'testing',
    version = '1.0.0',
    defaultFeatures = [],
    src = [],
    features = [],
    dependencies = [],
    references = [],
    targets = [],
    config = {},
    dir = join(__dirname, '../fixtures')
  } = options;

  return {
    name,
    version,
    metadata: { authors: [], publish: false, defaultFeatures },
    src,
    features,
    dependencies,
    references,
    targets,
    config: {},
    dir
  };
}
