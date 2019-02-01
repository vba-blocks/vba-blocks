import * as colors from 'ansi-colors';
import { ok } from 'assert';
import env from './env';
import { isString } from './utils/is';
export class CliError extends Error {
    constructor(message, options = {}) {
        if (options.underlying) {
            const underlying = cleanError(options.underlying);
            message += `\n\n${colors.dim(underlying.message)}`;
        }
        super(message);
        this.code = options.code;
        this.underlying = options.underlying;
    }
}
// Errors
export const unknownCommand = (command) => generateError('unknown-command', { command });
export const manifestNotFound = (dir) => generateError('manifest-not-found', { dir });
export const manifestInvalid = (message) => generateError('manifest-invalid', { message });
export const manifestOk = (value, message) => ok(value, manifestInvalid(message));
export const sourceUnsupported = (type) => generateError('source-unsupported', { type });
export const sourceMisconfiguredRegistry = (registry) => generateError('source-misconfigured-registry', { registry });
export const sourceNoneMatching = (type, source) => generateError('source-no-matching', { type, source });
export const sourceDownloadFailed = (source, underlying) => generateError('source-download-failed', { source }, underlying);
export const sourceUnrecognizedType = (type) => generateError('source-unrecognized-type', { type });
export const dependencyNotFound = (dependency, registry) => generateError('dependency-not-found', { dependency, registry });
export const dependencyInvalidChecksum = (registration) => generateError('dependency-invalid-checksum', { registration });
export const dependencyPathNotFound = (dependency, path) => generateError('dependency-path-not-found', { dependency, path });
export const dependencyUnknownSource = (dependency) => generateError('dependency-unknown-source', { dependency });
export const buildInvalid = (message) => generateError('build-invalid', { message });
export const lockfileWriteFailed = (file, underlying) => generateError('lockfile-write-failed', { file }, underlying);
export const targetNoMatching = (type) => generateError('target-no-matching', { type });
export const targetNoDefault = () => generateError('target-no-default', {});
export const targetNotFound = (target) => generateError('target-not-found', { target });
export const targetIsOpen = (target, path) => generateError('target-is-open', { target, path });
export const targetCreateFailed = (target, underlying) => generateError('target-create-failed', { target }, underlying);
export const targetImportFailed = (target, underlying) => generateError('target-import-failed', { target }, underlying);
export const targetRestoreFailed = (backup, file, underlying) => generateError('target-restore-failed', { backup, file }, underlying);
export const targetAddNoType = () => generateError('target-add-no-type', {});
export const targetAlreadyDefined = () => generateError('target-already-defined', {});
export const resolveFailed = (details) => {
    const code = 'resolve-failed';
    let formatted = env.reporter.errors[code]({});
    if (details) {
        formatted += `\n${details}`;
    }
    return new CliError(formatted, { code });
};
export const unrecognizedComponent = (path) => generateError('component-unrecognized', { path });
export const componentInvalidNoName = () => generateError('component-invalid-no-name', {});
export const runScriptNotFound = (path) => generateError('run-script-not-found', { path });
export const newNameRequired = () => generateError('new-name-required', {});
export const newTargetRequired = () => generateError('new-target-required', {});
export const newDirExists = (name, dir) => generateError('new-dir-exists', { name, dir });
export const fromNotFound = (from) => generateError('from-not-found', { from });
export const initAlreadyInitialized = () => generateError('init-already-initialized', {});
export const initNameRequired = () => generateError('init-name-required', {});
export const initTargetRequired = () => generateError('init-target-required', {});
export const exportNoDefault = () => generateError('export-no-target', {});
export const exportNoMatching = (type) => generateError('export-no-matching', { type });
export const exportTargetNotFound = (target, path) => generateError('export-target-not-found', { target, path });
export const addinUnsupportedType = (type) => generateError('addin-unsupported-type', { type });
export const runMissingFile = () => generateError('run-missing-file', {});
export const runMissingMacro = () => generateError('run-missing-macro', {});
// Utils
function generateError(code, values, underlying) {
    const message = env.reporter.errors[code];
    const formatted = message(values);
    return new CliError(formatted, { code, underlying });
}
const MESSAGE_REGEXP = /(^(.|\n)*?(?=\n\s*at\s.*\:\d*\:\d*))/;
const ERROR_TEXT = 'Error: ';
export function cleanError(error) {
    const content = (isString(error) ? error : error.stack) || 'EMPTY ERROR';
    const message_match = content.match(MESSAGE_REGEXP);
    let message = message_match ? message_match[0] : content;
    const stack = message_match ? content.slice(message.length) : '';
    if (message.startsWith(ERROR_TEXT)) {
        message = message.substr(ERROR_TEXT.length);
    }
    return { message, stack };
}
