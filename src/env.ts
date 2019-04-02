import envPaths from 'env-paths';
import _debug from 'debug';
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
  debug: id => _debug(id),
  silent: false
};

export default env;
