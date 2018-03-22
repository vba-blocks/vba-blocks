import { homedir } from 'os';
import unixJoin from './utils/unix-join';
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
  staging: string | null;

  reporter: Reporter;
}

const cache = unixJoin(homedir(), '.vba-blocks');
const env: Env = {
  isWindows: process.platform === 'win32',
  cwd: process.cwd(),
  values: process.env,

  addins: unixJoin(__dirname, '../../addin/build'),
  scripts: unixJoin(__dirname, '../scripts'),
  cache,
  registry: unixJoin(cache, 'registry'),
  packages: unixJoin(cache, 'packages'),
  sources: unixJoin(cache, 'sources'),
  staging: null,

  reporter
};

export default env;
