import chalk from 'chalk';
import env from './env';
import { cleanError, isString } from './utils';

import { Target } from './manifest';

export interface CliErrors {
  'unsupported-source': (type: string) => string;
  'target-is-open': (target: Target, path: string) => string;
  'unknown-command': (command: string) => string;
}

export interface CliErrorOptions {
  code?: string;
  underlying?: Error;
}

export class CliError extends Error {
  code?: string;
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

export function unsupportedSource(type: string): Error {
  const code = 'unsupported-source';
  const message = env.reporter.errors[code](type);

  return new CliError(message, { code });
}

export function targetIsOpen(target: Target, path: string): Error {
  const code = 'target-is-open';
  const message = env.reporter.errors[code](target, path);

  return new CliError(message, { code });
}

export function unknownCommand(command: string): Error {
  const code = 'unknown-command';
  const message = env.reporter.errors[code](command);

  return new CliError(message, { code });
}
