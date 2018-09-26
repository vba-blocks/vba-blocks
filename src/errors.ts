import chalk from 'chalk';
import { ok } from 'assert';
import env from './env';
import { isString } from './utils/is';

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

// Errors

export const unknownCommand = (command: string) =>
  generateError('unknown-command', { command });

export const manifestNotFound = (dir: string) =>
  generateError('manifest-not-found', { dir });

export const manifestInvalid = (message: string) =>
  generateError('manifest-invalid', { message });

export const manifestOk = (value: any, message: string) =>
  ok(value, manifestInvalid(message));

export const sourceUnsupported = (type: string) =>
  generateError('source-unsupported', { type });

export const sourceMisconfiguredRegistry = (registry: string) =>
  generateError('source-misconfigured-registry', { registry });

export const sourceNoneMatching = (type: string, source: string) =>
  generateError('source-no-matching', { type, source });

export const sourceDownloadFailed = (source: string, underlying: Error) =>
  generateError('source-download-failed', { source }, underlying);

export const sourceUnrecognizedType = (type: string) =>
  generateError('source-unrecognized-type', { type });

export const dependencyNotFound = (dependency: string, registry: string) =>
  generateError('dependency-not-found', { dependency, registry });

export const dependencyInvalidChecksum = (registration: Registration) =>
  generateError('dependency-invalid-checksum', { registration });

export const dependencyPathNotFound = (dependency: string, path: string) =>
  generateError('dependency-path-not-found', { dependency, path });

export const dependencyUnknownSource = (dependency: string) =>
  generateError('dependency-unknown-source', { dependency });

export const buildInvalid = (message: string) =>
  generateError('build-invalid', { message });

export const lockfileWriteFailed = (file: string, underlying: Error) =>
  generateError('lockfile-write-failed', { file }, underlying);

export const targetNoMatching = (type: string) =>
  generateError('target-no-matching', { type });

export const targetNoDefault = () => generateError('target-no-default', {});

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

export const targetAddNoType = () => generateError('target-add-no-type', {});

export const resolveFailed = (details?: string) => {
  const code = 'resolve-failed';

  let formatted = env.reporter.errors[code]({});
  if (details) {
    formatted += `\n${details}`;
  }

  return new CliError(formatted, { code });
};

export const unrecognizedComponent = (path: string) =>
  generateError('component-unrecognized', { path });

export const componentInvalidNoName = () =>
  generateError('component-invalid-no-name', {});

export const runScriptNotFound = (path: string) =>
  generateError('run-script-not-found', { path });

export const newNameRequired = () => generateError('new-name-required', {});

export const newDirExists = (name: string, dir: string) =>
  generateError('new-dir-exists', { name, dir });

export const fromNotFound = (from: string) =>
  generateError('from-not-found', { from });

export const exportNoDefault = () => generateError('export-no-target', {});

export const exportNoMatching = (type: string) =>
  generateError('export-no-matching', { type });

export const exportTargetNotFound = (target: Target, path: string) =>
  generateError('export-target-not-found', { target, path });

export const addinUnsupportedType = (type: string) =>
  generateError('addin-unsupported-type', { type });

export const runMissingFile = () => generateError('run-missing-file', {});

export const runMissingMacro = () => generateError('run-missing-macro', {});

// Utils

function generateError<T extends CliErrorCode>(
  code: T,
  values: ErrorMessages[T],
  underlying?: Error
): CliError {
  type Message = (values: ErrorMessages[T]) => string;

  const message = <Message>env.reporter.errors[code];
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
