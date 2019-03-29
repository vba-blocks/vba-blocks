import { homedir } from 'os';
import { join } from './utils/path';
import getStaging from './utils/get-staging';
import { reporter } from './reporter';

import { Env } from './types';

// TODO This should go in AppData
const cache = join(homedir(), '.vba-blocks');
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
  silent: false
};

export default env;
