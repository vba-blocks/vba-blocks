import { join } from 'path';
import { promisify } from 'util';
const exec = promisify(require('child_process').exec);
import env from '../env';
import { isString, pathExists } from '../utils';
import { Config } from '../config';
import { runScriptNotFound } from '../errors';

export interface RunResult {
  success: boolean;
  messages: string[];
  warnings: string[];
  errors: string[];
  stdout?: string;
  stderr?: string;
}

export class RunError extends Error {
  result: RunResult;

  constructor(result: RunResult) {
    const message = result.errors.join('\n');
    super(message);

    this.result = result;
  }
}

export default async function run(
  config: Config,
  application: string,
  file: string,
  macro: string,
  args: object
): Promise<RunResult> {
  const script = join(
    env.scripts,
    env.isWindows ? 'run.vbs' : 'run.applescript'
  );
  if (!await pathExists(script)) {
    throw runScriptNotFound(script);
  }

  const command = env.isWindows
    ? `cscript ${script} ${application} "${escape(file)}" ${macro} "${escape(
        JSON.stringify(args)
      )}"`
    : `osascript ${script} '${application}' '${file}' '${
        macro
      }' '${JSON.stringify(args)}'`;

  let result;
  try {
    const { stdout, stderr } = await exec(command);

    result = toResult(stdout, stderr);
  } catch (err) {
    result = toResult(err.stdout, err.stderr, err);
  }

  if (!result.success) {
    throw new RunError(result);
  }

  return result;
}

export function escape(value: string): string {
  return value.replace(/\"/g, '|Q|').replace(/ /g, '|S|');
}

export function toResult(
  stdout: string,
  stderr: string,
  err?: Error
): RunResult {
  // For windows, remove cscript header (denoted by ----- divider)
  // TODO Pass /nologo argument to script
  if (stdout && env.isWindows) {
    const divider = stdout.indexOf('-----\r\n');
    if (divider >= 0) stdout = stdout.substr(divider + 7);
  }

  let info;
  try {
    info = JSON.parse(stdout);
  } catch (err) {
    info = {
      success: false,
      messages: [],
      warnings: [],
      errors: []
    };
  }

  if (err) {
    info.success = false;
    info.errors.push(err.message);
  }

  return { ...info, stdout, stderr };
}
