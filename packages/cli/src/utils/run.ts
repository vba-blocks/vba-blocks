import { join } from 'path';
import { promisify } from 'util';
import { platform } from 'os';
const exec = promisify(require('child_process').exec);
import { Config } from '../config';

export default async function run(
  config: Config,
  application: string,
  addin: string,
  command: string,
  value: object
): Promise<any> {
  const isWindows = platform() === 'win32';
  const script = join(config.scripts, isWindows ? 'run.vbs' : 'run.scpt');

  const prepared = escape(JSON.stringify(value));
  const cmd = isWindows ? `cscript "${script}"` : `"${script}"`;
  const { stdout, stderr } = await exec(
    `${cmd} ${application} ${addin} ${command} "${value}"`
  );
}

export function escape(value: string): string {
  return value.replace(/\"/g, '|Q|').replace(/ /g, '|S|');
}
