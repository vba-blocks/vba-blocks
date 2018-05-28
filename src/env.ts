import { homedir } from 'os';
import unixJoin from './utils/unix-join';
import getStaging from './utils/get-staging';
import isPackaged from './utils/is-packaged';
import { Reporter, reporter } from './reporter';

export interface Env {
  isWindows: boolean;
  cwd: string;
  values: any;

  addins: string;
  scripts: string;
  cache: string;
  registry: string;
  packages: string;
  sources: string;
  staging: string;

  reporter: Reporter;
}

const cache = unixJoin(homedir(), '.vba-blocks');
const env: Env = {
  isWindows: process.platform === 'win32',
  cwd: process.cwd(),
  values: process.env,

  addins: isPackaged()
    ? unixJoin(process.execPath, '../../addins')
    : unixJoin(__dirname, 'DIR-ADDINS'),
  scripts: isPackaged()
    ? unixJoin(process.execPath, '../../run-scripts')
    : unixJoin(__dirname, 'DIR-RUN-SCRIPTS'),
  cache,
  registry: unixJoin(cache, 'registry'),
  packages: unixJoin(cache, 'packages'),
  sources: unixJoin(cache, 'sources'),
  staging: getStaging(cache),

  reporter
};

export default env;
