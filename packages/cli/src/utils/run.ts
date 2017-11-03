import { join } from 'path';
import { promisify } from 'util';
const exec = promisify(require('child_process').exec);
import env from '../env';
import { Config } from '../config';

export default async function run(
  config: Config,
  application: string,
  addin: string,
  command: string,
  value: object
): Promise<string> {
  const { build: { script } } = config;

  const prepared = escape(JSON.stringify(value));
  const cmd = env.isWindows ? `cscript "${script.windows}"` : `"${script.mac}"`;

  try {
    let { stdout } = await exec(
      `${cmd} ${application} ${addin} ${command} "${prepared}"`
    );

    // For windows, remove cscript header (denoted by ----- divider)
    if (env.isWindows) {
      const divider = stdout.indexOf('-----\r\n');
      stdout = divider >= 0 ? stdout.substr(divider + 7) : stdout;
    }

    return stdout;
  } catch (err) {
    throw new Error(err.stderr);
  }
}

export function escape(value: string): string {
  return value.replace(/\"/g, '|Q|').replace(/ /g, '|S|');
}
