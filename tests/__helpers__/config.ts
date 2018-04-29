import { Config } from '../../src/config';
import { PathSource, GitSource } from '../../src/sources';
import RegistrySource from './registry-source';

export function getConfig(): Config {
  const registry = {
    'vba-blocks': {
      index: 'https://github.com/vba-blocks/registry',
      packages: 'https://packages.vba-blocks.com'
    }
  };

  return {
    registry,
    flags: { git: true, path: true },
    sources: {
      registry: {
        'vba-blocks': new RegistrySource()
      },
      path: new PathSource(),
      git: new GitSource()
    }
  };
}
