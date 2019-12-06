import dedent from '@timhall/dedent/macro';
import colors from 'ansi-colors';
import { ok } from 'assert';
import has from './utils/has';
import { isString } from './utils/is';

export class CliError extends Error {
  code: ErrorCode;
  underlying?: Error;

  constructor(code: ErrorCode, message: string, underlying?: Error) {
    if (underlying) {
      const { message: underlying_message } = cleanError(underlying);
      message += `\n\n${colors.dim(underlying_message)}`;
    }

    // TODO
    // message += `\nSee https://vba-blocks.com/errors/${code} for more information.`;

    super(message);

    this.code = code;
    this.underlying = underlying;
  }
}

export function isCliError(error: Error | CliError): error is CliError {
  return has(error, 'underlying');
}

export enum ErrorCode {
  Unknown = 'unknown',
  UnknownCommand = 'unknown-command',
  ManifestNotFound = 'manifest-not-found',
  ManifestInvalid = 'manifest-invalid',
  ManifestNameInvalid = 'manifest-name-invalid',
  SourceUnsupported = 'source-unsupported',
  SourceMisconfiguredRegistry = 'source-misconfigured-registry',
  SourceNoneMatching = 'source-none-matching',
  SourceDownloadFailed = 'source-download-failed',
  SourceUnrecognizedType = 'source-unrecognized-type',
  DependencyNotFound = 'dependency-not-found',
  DependencyInvalidChecksum = 'dependency-invalid-checksum',
  DependencyPathNotFound = 'dependency-path-not-found',
  DependencyUnknownSource = 'dependency-unknown-source',
  BuildInvalid = 'build-invalid',
  LockfileWriteFailed = 'lockfile-write-failed',
  TargetNoMatching = 'target-no-matching',
  TargetNoDefault = 'target-no-default',
  TargetNotFound = 'target-not-found',
  TargetIsOpen = 'target-is-open',
  TargetCreateFailed = 'target-create-failed',
  TargetImportFailed = 'target-import-failed',
  TargetRestoreFailed = 'target-restore-failed',
  TargetAddNoType = 'target-add-no-type',
  TargetAlreadyDefined = 'target-already-defined',
  ResolveFailed = 'resolve-failed',
  ComponentUnrecognized = 'component-unrecognized',
  ComponentInvalidNoName = 'component-invalid-no-name',
  RunScriptNotFound = 'run-script-not-found',
  NewNameRequired = 'new-name-required',
  NewTargetRequired = 'new-target-required',
  NewDirExists = 'new-dir-exists',
  FromNotFound = 'from-not-found',
  InitAlreadyInitialized = 'init-already-initialized',
  InitNameRequired = 'init-name-required',
  InitTargetRequired = 'init-target-required',
  ExportNoTarget = 'export-no-target',
  ExportNoMatching = 'export-no-matching',
  ExportTargetNotFound = 'export-target-not-found',
  AddinUnsupportedType = 'addin-unsupported-type',
  RunMissingFile = 'run-missing-file',
  RunMissingMacro = 'run-missing-macro',
  RegistryCloneFailed = 'registry-clone-failed',
  InvalidVersion = 'invalid-version'
}

export function manifestOk(value: any, message: string) {
  const error = new CliError(
    ErrorCode.ManifestInvalid,
    dedent`
      vba-blocks.toml is invalid:

      ${message}
    `
  );

  ok(value, error);
}

// Utils

const MESSAGE_REGEXP = /(^(.|\n)*?(?=\n\s*at\s.*\:\d*\:\d*))/;
const ERROR_TEXT = 'Error: ';

export function cleanError(error: string | Error): { message: string; stack: string } {
  const content = (isString(error) ? error : error.stack) || 'EMPTY ERROR';
  const message_match = content.match(MESSAGE_REGEXP);

  let message = message_match ? message_match[0] : content;
  const stack = message_match ? content.slice(message.length) : '';

  if (message.startsWith(ERROR_TEXT)) {
    message = message.substr(ERROR_TEXT.length);
  }

  return { message, stack };
}
