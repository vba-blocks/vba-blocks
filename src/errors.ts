import chalk from 'chalk';
import { ok } from 'assert';
import env from './env';
import { isString, isObject } from './utils/is';

import { Target } from './manifest';
import { Registration } from './sources';
import { ErrorMessages } from './reporter';

export type CliErrorCode = keyof ErrorMessages;

export interface CliErrorOptions {
  code?: CliErrorCode;
  underlying?: Error;
}

export class CliError extends Error {
  code?: CliErrorCode;
  underlying?: Error;

  constructor(message: string, options: CliErrorOptions = {}) {
    if (options.underlying) {
      const underlying = cleanError(options.underlying);
      message += chalk`\n\n{dim ${underlying.message}}`;
    }

    super(message);

    this.code = options.code;
    this.underlying = options.underlying;
  }
}

export const unknownCommand = (command: string) =>
  generateError('unknown-command', { command });

export const manifestNotFound = (dir: string) =>
  generateError('manifest-not-found', { dir });

export const manifestInvalid = (message: string) =>
  generateError('manifest-invalid', { message });

export const manifestOk = (value: any, message: string) =>
  ok(value, manifestInvalid(message));

export const unsupportedSource = (type: string) =>
  generateError('unsupported-source', { type });

export const dependencyNotFound = (dependency: string, registry: string) =>
  generateError('dependency-not-found', { dependency, registry });

export const dependencyInvalidChecksum = (registration: Registration) =>
  generateError('dependency-invalid-checksum', { registration });

export const lockfileWriteFailed = (file: string, underlying: Error) =>
  generateError('lockfile-write-failed', { file }, underlying);

export const targetNotFound = (target: Target) =>
  generateError('target-not-found', { target });

export const targetIsOpen = (target: Target, path: string) =>
  generateError('target-is-open', { target, path });

export const targetCreateFailed = (target: Target, underlying: Error) =>
  generateError('target-create-failed', { target }, underlying);

export const targetImportFailed = (target: Target, underlying: Error) =>
  generateError('target-import-failed', { target }, underlying);

export const targetRestoreFailed = (
  backup: string,
  file: string,
  underlying: Error
) => generateError('target-restore-failed', { backup, file }, underlying);

export const resolveFailed = (details?: string) => {
  const code = 'resolve-failed';

  let formatted = env.reporter.messages.errors[code]({});
  if (details) {
    formatted += `\n${details}`;
  }

  return new CliError(formatted, { code });
};

export const runScriptNotFound = (path: string) =>
  generateError('run-script-not-found', { path });

function generateError<T extends CliErrorCode>(
  code: T,
  values: ErrorMessages[T],
  underlying?: Error
): CliError {
  type Message = (values: ErrorMessages[T]) => string;

  const message = <Message>env.reporter.messages.errors[code];
  const formatted = message(values);

  return new CliError(formatted, { code, underlying });
}

const MESSAGE_REGEXP = /(^(.|\n)*?(?=\n\s*at\s.*\:\d*\:\d*))/;
const ERROR_TEXT = 'Error: ';

export function cleanError(
  error: string | Error
): { message: string; stack: string } {
  const content = (isString(error) ? error : error.stack) || 'EMPTY ERROR';
  const message_match = content.match(MESSAGE_REGEXP);

  let message = message_match ? message_match[0] : content;
  const stack = message_match ? content.slice(message.length) : '';

  if (message.startsWith(ERROR_TEXT)) {
    message = message.substr(ERROR_TEXT.length);
  }

  return { message, stack };
}
