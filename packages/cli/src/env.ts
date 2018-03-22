import { join } from 'path';
import { homedir } from 'os';
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

const cache = join(homedir(), '.vba-blocks');
const env: Env = {
  isWindows: process.platform === 'win32',
  cwd: process.cwd(),
  values: process.env,

  addins: join(__dirname, '../../addin/build'),
  scripts: join(__dirname, '../scripts'),
  cache,
  registry: join(cache, 'registry'),
  packages: join(cache, 'packages'),
  sources: join(cache, 'sources'),
  staging: null,

  reporter
};

export default env;
