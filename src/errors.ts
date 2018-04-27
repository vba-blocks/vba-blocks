import chalk from 'chalk';
import env from './env';
import { cleanError, isString, isObject } from './utils';

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

export const unsupportedSource = (type: string) =>
  generateError('unsupported-source', { type });

export const dependencyNotFound = (dependency: string, registry: string) =>
  generateError('dependency-not-found', { dependency, registry });

export const dependencyInvalidChecksum = (registration: Registration) =>
  generateError('dependency-invalid-checksum', { registration });

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
