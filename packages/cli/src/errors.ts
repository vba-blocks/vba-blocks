import chalk from 'chalk';
import env from './env';
import { cleanError, isString } from './utils';

import { Target } from './manifest';
import { Registration } from './sources';

export interface CliErrors {
  'unknown-command': (command: string) => string;

  'unsupported-source': (type: string) => string;
  'dependency-not-found': (dependency: string, registry: string) => string;
  'dependency-invalid-checksum': (registration: Registration) => string;

  'target-not-found': (target: Target) => string;
  'target-is-open': (target: Target, path: string) => string;
  'target-import-failed': (target: Target) => string;
  'target-restore-failed': (backup: string, file: string) => string;

  'resolve-failed': (details?: string) => string;

  'run-script-not-found': (path: string) => string;
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

// TODO Resolve typing issues so the following isn't so repetitive/verbose

export function unknownCommand(command: string): Error {
  const code = 'unknown-command';
  const message = env.reporter.errors[code](command);

  return new CliError(message, { code });
}

export function unsupportedSource(type: string): Error {
  const code = 'unsupported-source';
  const message = env.reporter.errors[code](type);

  return new CliError(message, { code });
}

export function dependencyNotFound(
  dependency: string,
  registry: string
): Error {
  const code = 'dependency-not-found';
  const message = env.reporter.errors[code](dependency, registry);

  return new CliError(message, { code });
}

export function dependencyInvalidChecksum(registration: Registration): Error {
  const code = 'dependency-invalid-checksum';
  const message = env.reporter.errors[code](registration);

  return new CliError(message, { code });
}

export function targetNotFound(target: Target): Error {
  const code = 'target-not-found';
  const message = env.reporter.errors[code](target);

  return new CliError(message, { code });
}

export function targetIsOpen(target: Target, path: string): Error {
  const code = 'target-is-open';
  const message = env.reporter.errors[code](target, path);

  return new CliError(message, { code });
}

export function targetImportFailed(target: Target, underlying: Error): Error {
  const code = 'target-import-failed';
  const message = env.reporter.errors[code](target);

  return new CliError(message, { code, underlying });
}

export function targetRestoreFailed(
  backup: string,
  file: string,
  underlying: Error
): Error {
  const code = 'target-restore-failed';
  const message = env.reporter.errors[code](backup, file);

  return new CliError(message, { code, underlying });
}

export function resolveFailed(details?: string): Error {
  const code = 'resolve-failed';
  let message = env.reporter.errors[code]();
  if (details) {
    message += `\n${details}`;
  }

  return new CliError(message, { code });
}

export function runScriptNotFound(path: string): Error {
  const code = 'run-script-not-found';
  const message = env.reporter.errors[code](path);

  return new CliError(message, { code });
}
