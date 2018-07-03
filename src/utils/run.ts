import { promisify } from 'util';
const exec = promisify(require('child_process').exec);

import env from '../env';
import { join } from './path';
import { pathExists } from './fs';
import { runScriptNotFound } from '../errors';

const debug = require('debug')('vba-blocks:run');

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
  args: object = {}
): Promise<RunResult> {
  const script = join(
    env.scripts,
    env.isWindows ? 'run.vbs' : 'run.applescript'
  );

  if (!(await pathExists(script))) {
    throw runScriptNotFound(script);
  }

  const parts = [application, file, macro, JSON.stringify(args)];
  const command = env.isWindows
    ? `cscript //Nologo ${script} ${parts
        .map(part => `"${escape(part)}"`)
        .join(' ')}`
    : `osascript ${script}  ${parts.map(part => `'${part}'`).join(' ')}`;

  debug('Run:');
  debug('params:', { application, file, macro, args });
  debug('command:', command);

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
    info = { success: false };
  }

  let { success, messages = [], warnings = [], errors = [] } = info;

  if (err) {
    success = false;
    errors.push(err.message);
  }

  return { success, messages, warnings, errors, stdout, stderr };
}
