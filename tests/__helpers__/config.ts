import MockSource from './mock-source';
import { Config } from '../../src/config';

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
        'vba-blocks': new MockSource()
      },
      path: new MockSource(),
      git: new MockSource()
    }
  };
}
