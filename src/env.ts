import { homedir } from 'os';
import _debug from 'debug';
import { join } from './utils/path';
import getStaging from './utils/get-staging';
import { reporter } from './reporter';

import { Env } from './types';

const is_windows = process.platform === 'win32';

const cache = is_windows
  ? process.env.LOCALAPPDATA
    ? join(process.env.LOCALAPPDATA, 'vba-blocks')
    : join(homedir(), '.vba-blocks') // Fallback to "hidden" directory in home directory (not actually hidden)
  : join(homedir(), 'Library', 'Caches', 'vba-blocks');
const root = join(__dirname, '../');

const env: Env = {
  isWindows: process.platform === 'win32',
  cwd: process.cwd(),
  values: process.env,

  addins: join(root, 'addins/build'),
  scripts: join(root, 'run-scripts'),
  bin: join(root, 'bin'),
  cache,
  registry: join(cache, 'registry'),
  packages: join(cache, 'packages'),
  sources: join(cache, 'sources'),
  staging: getStaging(cache),

  reporter,
  debug: id => _debug(id),
  silent: false
};

export default env;
