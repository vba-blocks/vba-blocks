import { homedir } from 'os';
import { join } from './utils/path';
import getStaging from './utils/get-staging';
import isPackaged from './utils/is-packaged';
import { Reporter, reporter } from './reporter';

export interface Env {
  isWindows: boolean;
  cwd: string;
  values: any;

  addins: string;
  scripts: string;
  bin: string;
  cache: string;
  registry: string;
  packages: string;
  sources: string;
  staging: string;

  reporter: Reporter;
  silent: boolean;
}

const cache = join(homedir(), '.vba-blocks');
const env: Env = {
  isWindows: process.platform === 'win32',
  cwd: process.cwd(),
  values: process.env,

  addins: isPackaged() ? join(process.execPath, '../../addins') : join(__dirname, 'DIR-ADDINS'),
  scripts: isPackaged()
    ? join(process.execPath, '../../run-scripts')
    : join(__dirname, 'DIR-RUN-SCRIPTS'),
  bin: isPackaged() ? join(process.execPath, '../../bin') : join(__dirname, 'DIR-BIN'),
  cache,
  registry: join(cache, 'registry'),
  packages: join(cache, 'packages'),
  sources: join(cache, 'sources'),
  staging: getStaging(cache),

  reporter,
  silent: false
};

export default env;
