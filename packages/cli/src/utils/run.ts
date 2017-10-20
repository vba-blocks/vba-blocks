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
): Promise<any> {
  const { build: { script } } = config;

  const prepared = escape(JSON.stringify(value));
  const cmd = env.isWindows ? `cscript "${script.windows}"` : `"${script.mac}"`;
  const { stdout, stderr } = await exec(
    `${cmd} ${application} ${addin} ${command} "${value}"`
  );
}

export function escape(value: string): string {
  return value.replace(/\"/g, '|Q|').replace(/ /g, '|S|');
}
