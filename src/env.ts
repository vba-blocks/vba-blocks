import envPaths from 'env-paths';
import { join } from './utils/path';
import getStaging from './utils/get-staging';
import { reporter } from './reporter';

import { Env } from './types';

const paths = envPaths('vba-blocks', { suffix: '' });

const cache = paths.cache;
const root = join(__dirname, '../');

const env: Env = {
  isWindows: process.platform === 'win32',
  cwd: process.cwd(),
  values: process.env,

  ...paths, // data, config, cache, log, temp
  addins: join(root, 'addins/build'),
  scripts: join(root, 'run-scripts'),
  bin: join(root, 'bin'),
  registry: join(cache, 'registry'),
  packages: join(cache, 'packages'),
  sources: join(cache, 'sources'),
  staging: getStaging(paths.temp),

  reporter,
  debug: id => {
    // Late-bind debug to allow loading --debug first
    let debug: (...args: any[]) => any;

    return (...args) => {
      if (!debug) {
        const _debug = require('debug');
        debug = _debug(id);
      }

      return debug(...args);
    };
  },
  silent: false
};

export default env;
