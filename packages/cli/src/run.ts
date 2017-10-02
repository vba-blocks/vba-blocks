import { join } from 'path';
import { promisify } from 'util';
import { platform } from 'os';
const exec = promisify(require('child_process').exec);
import { Config } from './config';
import { Target } from './manifest';

const extensions: { [application: string]: string[] } = {
  excel: ['xlsx', 'xlsm', 'xlam']
};
const addins: { [application: string]: string } = {
  excel: 'vba-blocks.xlam'
};

const byType: { [type: string]: string } = {};
for (const [application, types] of Object.entries(extensions)) {
  for (const type of types) {
    byType[type] = application;
  }
}

export default async function run(
  config: Config,
  target: Target,
  command: string,
  ...args: any[]
): Promise<any> {
  const application = byType[target.type];
  if (!application) {
    throw new Error(`Unsupported target type "target.type"`);
  }

  const isWindows = platform() === 'win32';
  const script = join(config.scripts, isWindows ? 'run.vbs' : 'run.scpt');

  const addin = addins[application];
  const file = join(config.build, `${target.name}.${target.type}`);
  const value = escape(JSON.stringify({ file, args }));

  const cmd = isWindows ? `cscript "${script}"` : `"${script}"`;
  const { stdout, stderr } = await exec(
    `${cmd} ${application} ${addin} ${command} "${value}"`
  );
}

export function escape(value: string): string {
  return value.replace(/\"/g, '|Q|').replace(/ /g, '|S|');
}
