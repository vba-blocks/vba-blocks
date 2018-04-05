import { promisify } from 'util';
const exec = promisify(require('child_process').exec);
import env from '../env';
import { isString } from './is';
import { pathExists } from './fs';
import unixJoin from './unix-join';
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
  application: string,
  file: string,
  macro: string,
  args: object
): Promise<RunResult> {
  const script = unixJoin(
    env.scripts,
    env.isWindows ? 'run.vbs' : 'run.applescript'
  );

  return execute(script, [application, file, macro, JSON.stringify(args)]);
}

export async function open(
  application: string,
  file: string
): Promise<RunResult> {
  const script = unixJoin(
    env.scripts,
    env.isWindows ? 'open.vbs' : 'open.applescript'
  );

  return execute(script, [application, file]);
}

export async function close(
  application: string,
  file: string
): Promise<RunResult> {
  const script = unixJoin(
    env.scripts,
    env.isWindows ? 'close.vbs' : 'close.applescript'
  );

  return execute(script, [application, file]);
}

async function execute(script: string, args: string[]): Promise<RunResult> {
  if (!await pathExists(script)) {
    throw runScriptNotFound(script);
  }

  const command = env.isWindows
    ? `cscript //Nologo ${script} ${args
        .map(part => `"${escape(part)}"`)
        .join(' ')}`
    : `osascript ${script}  ${args.map(part => `'${part}'`).join(' ')}`;

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
  // TODO Test robustness/validity of this approach
  return value.replace(/\"/g, '|Q|').replace(/ /g, '|S|');
}

export function toResult(
  stdout: string,
  stderr: string,
  err?: Error
): RunResult {
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
