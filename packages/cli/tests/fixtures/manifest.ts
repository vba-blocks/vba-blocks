import { RegistryDependency } from '../../src/manifest/dependency';
import { createManifest } from '../helpers/manifest';

export const simple = createManifest({
  name: 'simple-manifest',
  dependencies: [
    <RegistryDependency>{
      name: 'a',
      default_features: true,
      features: [],
      optional: false,
      version: '^1.0.0'
    }
  ]
});
