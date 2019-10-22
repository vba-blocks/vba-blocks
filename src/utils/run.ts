import dedent from '@timhall/dedent/macro';
import { exec as _exec } from 'child_process';
import { promisify } from 'util';
import env from '../env';
import { CliError, ErrorCode } from '../errors';
import { pathExists } from './fs';
import has from './has';
import parallel from './parallel';
import { join } from './path';
import stdoutFile from './stdout-file';

const exec = promisify(_exec);

const debug = env.debug('vba-blocks:run');
const SPECIAL_FILE_STDOUT = env.isWindows ? 'CON' : '/dev/stdout';

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
    const message = result.errors.join('\n') || 'An unknown error occurred.';
    super(message);

    this.result = result;
  }
}

export function isRunError(error: Error | RunError): error is RunError {
  return has(error, 'result');
}

export default async function run(
  application: string,
  file: string,
  macro: string,
  args: string[]
): Promise<RunResult> {
  const script = join(env.scripts, env.isWindows ? 'run.vbs' : 'run.applescript');

  if (!(await pathExists(script))) {
    throw new CliError(
      ErrorCode.RunScriptNotFound,
      dedent`
        Bridge script not found at "${script}".

        This is a fatal error and will require vba-blocks to be re-installed.
      `
    );
  }

  const formatted_args = await parallel(args, async arg => {
    if (arg === SPECIAL_FILE_STDOUT) {
      return await stdoutFile();
    }

    return env.isWindows ? escape(arg) : arg;
  });
  const parts = [application, file, macro, ...formatted_args];
  const command = env.isWindows
    ? `cscript //Nologo "${script}" ${parts.map(part => `"${part}"`).join(' ')}`
    : `osascript '${script}' ${parts.map(part => `'${part}'`).join(' ')}`;

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

  debug('result:', result);
  return result;
}

export function escape(value: string): string {
  // Checked DOS escape characters: http://www.robvanderwoude.com/escapechars.php
  // and only quotes inside of quoted arguments to vbscript seemed to cause issues
  return value.replace(/\"/g, '^q');
}

export function unescape(value: string): string {
  return value.replace(/\^q/g, '"');
}

export function toResult(stdout: string, stderr: string, err?: Error): RunResult {
  let success = false;
  let messages: string[] = [];
  let warnings: string[] = [];
  let errors: string[] = [];

  if (stdout) {
    try {
      // For vba-blocks run, check for standard JSON result
      const parsed = JSON.parse(stdout);

      if ('success' in parsed && ('messages' in parsed || 'errors' in parsed)) {
        ({ success, messages = [], warnings = [], errors = [] } = parsed);
      } else {
        throw new Error('(ok, non-standard response)');
      }
    } catch (err) {
      success = true;
      messages = [stdout];
    }
  }

  if (err) {
    success = false;
    errors.push(unescape(err.message));
  }
  if (stderr) {
    success = false;
    errors.push(stderr);
  }

  return { success, messages, warnings, errors, stdout, stderr };
}
