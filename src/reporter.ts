import { extname } from './utils/path';
import dedent from 'dedent';
import { Target } from './manifest';
import { Registration } from './sources';

export interface ErrorMessages {
  'unknown-command': { command: string };
  'manifest-not-found': { dir: string };
  'manifest-invalid': { message: string };
  'source-unsupported': { type: string };
  'source-misconfigured-registry': { registry: string };
  'source-no-matching': { type: string; source: string };
  'source-download-failed': { source: string };
  'dependency-not-found': { dependency: string; registry: string };
  'dependency-invalid-checksum': { registration: Registration };
  'dependency-unknown-source': { dependency: string };
  'build-invalid': { message: string };
  'lockfile-write-failed': { file: string };
  'target-not-found': { target: Target };
  'target-is-open': { target: Target; path: string };
  'target-create-failed': { target: Target };
  'target-import-failed': { target: Target };
  'target-restore-failed': { backup: string; file: string };
  'resolve-failed': { details?: string };
  'component-unrecognized': { path: string };
  'run-script-not-found': { path: string };
  'new-name-required': {};
  'new-dir-exists': { name: string; dir: string };
  'from-not-found': { from: string };
}

export interface Messages {
  errors: { [T in keyof ErrorMessages]: (values: ErrorMessages[T]) => string };
}

export interface Reporter {
  progress: (name?: string) => Progress;
  messages: Messages;
}

export interface Progress {
  start: (count?: number) => void;
  tick: () => void;
  done: () => void;
}

export const reporter: Reporter = {
  progress(): Progress {
    return {
      start(count?: number) {},
      tick() {},
      done() {}
    };
  },

  messages: {
    errors: {
      'unknown-command': ({ command }) => dedent`
        Unknown command "${command}".

        Try "vba-blocks --help" for a list of commands.`,

      'manifest-not-found': ({ dir }) => dedent`
        vba-blocks.toml not found in "${dir}".`,

      'manifest-invalid': ({ message }) => dedent`
        vba-blocks.toml is invalid:
        
        ${message}`,

      'source-unsupported': ({ type }) => dedent`
        ${type} dependencies are not supported.

        Upgrade to Professional Edition for ${type} dependencies and more`,

      'source-misconfigured-registry': ({ registry }) => dedent`
        No matching registry configured for "${registry}"`,

      'source-no-matching': ({ type, source }) => dedent`
        No source matches given registration type "${type}" (source = "${source}")`,

      'source-download-failed': ({ source }) => dedent`
        Failed to download "${source}"`,

      'dependency-not-found': ({ dependency, registry }) => dedent`
        Dependency "${dependency}" not found in registry "${registry}"`,

      'dependency-invalid-checksum': ({ registration }) => dedent`
        Dependency "${registration.name}" failed validation.

        The downloaded file signature for ${
          registration.id
        } does not match the signature in the registry.`,

      'dependency-unknown-source': ({ dependency }) => dedent`
        No source matches dependency "${dependency}"`,

      'build-invalid': ({ message }) => dedent`
        Invalid build:
        
        ${message}.`,

      'lockfile-write-failed': ({ file }) => dedent`
        Failed to write lockfile to "${file}".`,

      'target-not-found': ({ target }) => dedent`
        Target "${target.name}" not found at "${target.path}"`,

      'target-is-open': ({ target, path }) => dedent`
        Failed to build target "${target.name}", it is currently open.

        Please close "${path}" and try again.`,

      'target-create-failed': ({ target }) => dedent`
        Failed to create project for target "${target.name}"`,

      'target-import-failed': ({ target }) => dedent`
        Failed to import project for target "${target.name}"`,

      'target-restore-failed': ({ backup, file }) => dedent`
        Failed to automatically restore backup from "${backup}" to "${file}".

        The previous version can be moved back manually, if desired.`,

      'resolve-failed': () => dedent`
        Unable to resolve dependency graph for project.

        There are dependencies that cannot be satisfied.`,

      'component-unrecognized': ({ path }) => dedent`
        Unrecognized component extension "${extname(path)}" (at "${path}").`,

      'run-script-not-found': ({ path }) => dedent`
        Bridge script not found at "${path}".

        This is a fatal error and will require vba-blocks to be re-installed.`,

      'new-name-required': _ => dedent`
        "name" is required with vba-blocks new (e.g. vba-blocks new project-name).

        Try \`vba-blocks new --help\` for more information.`,

      'new-dir-exists': ({ name, dir }) => dedent`
        A directory for "${name}" already exists: "${dir}".`,

      'from-not-found': ({ from }) => dedent`
        The \`from\` document was not found at "${from}"`
    }
  }
};
