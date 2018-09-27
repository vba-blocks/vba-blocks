import { extname } from './utils/path';
import dedent from 'dedent';
import { Target } from './manifest';
import { Registration } from './sources';
import { Project } from './project';

export interface Messages {
  'build-project-loading': {};
  'build-targets-building': { count: number };
  'build-target-building': {
    target: Target;
    project: Project;
    dependencies: string[];
  };
  'build-lockfile-writing': { skipped: boolean };

  'export-project-loading': {};
  'export-to-staging': { target: Target };
  'export-to-project': {};

  'project-updating': {};
  'dependencies-resolving': {};
  'dependencies-fetching': {};
  'export-loading': {};
  'patch-apply-changes': {};
  'patch-add-src': {};
  'patch-remove-src': { name: string };
  'patch-add-dependency': {};
  'patch-remove-dependency': { name: string };
}

export interface ErrorMessages {
  'unknown-command': { command: string };
  'manifest-not-found': { dir: string };
  'manifest-invalid': { message: string };
  'source-unsupported': { type: string };
  'source-misconfigured-registry': { registry: string };
  'source-no-matching': { type: string; source: string };
  'source-download-failed': { source: string };
  'source-unrecognized-type': { type: string };
  'dependency-not-found': { dependency: string; registry: string };
  'dependency-invalid-checksum': { registration: Registration };
  'dependency-path-not-found': { dependency: string; path: string };
  'dependency-unknown-source': { dependency: string };
  'build-invalid': { message: string };
  'lockfile-write-failed': { file: string };
  'target-no-matching': { type: string };
  'target-no-default': {};
  'target-not-found': { target: Target };
  'target-is-open': { target: Target; path: string };
  'target-create-failed': { target: Target };
  'target-import-failed': { target: Target };
  'target-restore-failed': { backup: string; file: string };
  'target-add-no-type': {};
  'resolve-failed': { details?: string };
  'component-unrecognized': { path: string };
  'component-invalid-no-name': {};
  'run-script-not-found': { path: string };
  'new-name-required': {};
  'new-dir-exists': { name: string; dir: string };
  'from-not-found': { from: string };
  'init-already-initialized': {};
  'init-name-required': {};
  'export-no-target': {};
  'export-no-matching': { type: string };
  'export-target-not-found': { target: Target; path: string };
  'addin-unsupported-type': { type: string };
  'run-missing-file': {};
  'run-missing-macro': {};
}

export interface Reporter {
  silent?: boolean;
  log: (message: string) => void;
  progress: (name: string) => Progress;
  messages: { [T in keyof Messages]: (values: Messages[T]) => string };
  errors: { [T in keyof ErrorMessages]: (values: ErrorMessages[T]) => string };
}

export interface Progress {
  start: (count?: number) => void;
  tick: () => void;
  done: () => void;
}

export const reporter: Reporter = {
  log(message) {
    if (!this.silent) console.log(message);
  },

  progress(name): Progress {
    return {
      start: () => {
        if (!this.silent) console.log(name);
      },
      tick() {},
      done() {}
    };
  },

  messages: {
    'build-project-loading': () => dedent`
      [1/3] Loading project...`,

    'build-targets-building': ({ count }) => dedent`
      \n[2/3] Building ${count.toLocaleString()} ${plural(
      count,
      'target',
      'targets'
    )}...`,

    'build-target-building': ({ target, project, dependencies }) => dedent`
      Building target "${target.type}" for "${project.manifest.name}"

      ${
        dependencies.length
          ? `Dependencies:\n${dependencies.join('\n')}`
          : '(no dependencies)'
      }`,

    'build-lockfile-writing': ({ skipped }) => dedent`
      \n[3/3] Writing lockfile...${skipped ? ' (skipped, no changes)' : ''}`,

    'export-project-loading': () => dedent`
      [1/3] Loading project...`,

    'export-to-staging': ({ target }) => dedent`
      \n[2/3] Exporting src from "${target.filename}"`,

    'export-to-project': () => dedent`
      \n[3/3] Updating project`,

    'project-updating': () => dedent`
      Updating src files`,

    'dependencies-resolving': () => dedent`
      Resolving dependencies`,

    'dependencies-fetching': () => dedent`
      Fetching dependencies`,

    'export-loading': () => dedent`
      Loading exported components`,

    'patch-apply-changes': () => dedent`
      \nThe following changes need to be applied to vba-block.toml:`,

    'patch-add-src': () => dedent`
      Add the following to the [src] section:`,

    'patch-remove-src': ({ name }) => dedent`
      Remove \`${name}\` from the [src] section`,

    'patch-add-dependency': () => dedent`
      Add the following to the [dependencies] section:`,

    'patch-remove-dependency': ({ name }) => dedent`
      Remove \`${name}\` from the [dependencies] section`
  },

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

      Upgrade to Professional Edition (coming soon) for ${type} dependencies and more.`,

    'source-misconfigured-registry': ({ registry }) => dedent`
      No matching registry configured for "${registry}".`,

    'source-no-matching': ({ type, source }) => dedent`
      No source matches given registration type "${type}" (source = "${source}").`,

    'source-download-failed': ({ source }) => dedent`
      Failed to download "${source}".`,

    'source-unrecognized-type': ({ type }) => dedent`
      Unrecognized source type "${type}" in registration ("registry", "path", and "git" are supported).`,

    'dependency-not-found': ({ dependency, registry }) => dedent`
      Dependency "${dependency}" not found in registry "${registry}".`,

    'dependency-invalid-checksum': ({ registration }) => dedent`
      Dependency "${registration.name}" failed validation.

      The downloaded file signature for ${
        registration.id
      } does not match the signature in the registry.`,

    'dependency-path-not-found': ({ dependency, path }) => dedent`
      Path not found for dependency "${dependency}" (${path}).`,

    'dependency-unknown-source': ({ dependency }) => dedent`
      No source matches dependency "${dependency}".`,

    'build-invalid': ({ message }) => dedent`
      Invalid build:
      
      ${message}`,

    'lockfile-write-failed': ({ file }) => dedent`
      Failed to write lockfile to "${file}".`,

    'target-no-matching': ({ type }) => dedent`
      No matching target found for type "${type}" in project.`,

    'target-no-default': () => dedent`
      No default target(s) found for project.
      Use --target TYPE for a blank target or specify [target] or [targets] in vba-block.toml.`,

    'target-not-found': ({ target }) => dedent`
      Target "${target.name}" not found at "${target.path}".`,

    'target-is-open': ({ target, path }) => dedent`
      Failed to build target "${target.name}", it is currently open.

      Please close "${path}" and try again.`,

    'target-create-failed': ({ target }) => dedent`
      Failed to create project for target "${target.name}".`,

    'target-import-failed': ({ target }) => dedent`
      Failed to import project for target "${target.name}".`,

    'target-restore-failed': ({ backup, file }) => dedent`
      Failed to automatically restore backup from "${backup}" to "${file}".

      The previous version can be moved back manually, if desired.`,

    'target-add-no-type': () => dedent`
      target TYPE is required to add a target (vba-blocks target add TYPE).`,

    'resolve-failed': () => dedent`
      Unable to resolve dependency graph for project.

      There are dependencies that cannot be satisfied.`,

    'component-unrecognized': ({ path }) => dedent`
      Unrecognized component extension "${extname(path)}" (at "${path}").`,

    'component-invalid-no-name': () => dedent`
      Invalid component: No attribute VB_Name found.`,

    'run-script-not-found': ({ path }) => dedent`
      Bridge script not found at "${path}".

      This is a fatal error and will require vba-blocks to be re-installed.`,

    'new-name-required': _ => dedent`
      "name" is required with vba-blocks new (e.g. vba-blocks new project-name).

      Try \`vba-blocks new --help\` for more information.`,

    'new-dir-exists': ({ name, dir }) => dedent`
      A directory for "${name}" already exists: "${dir}".`,

    'from-not-found': ({ from }) => dedent`
      The \`from\` document was not found at "${from}".`,

    'init-already-initialized': () => dedent`
      A vba-blocks project already exists in this directory.`,

    'init-name-required': () => dedent`
      Unable to determine name from current directory or --from. --name NAME is required to initialize this project.`,

    'export-no-target': () => dedent`
      No default target found for project, use --target TYPE to export from a specific target.`,

    'export-no-matching': ({ type }) => dedent`
      No matching target found for type "${type}" in project.`,

    'export-target-not-found': ({ target, path }) => dedent`
      Could not find built target for type "${
        target.type
      }" (checked "${path}").`,

    'addin-unsupported-type': ({ type }) => dedent`
      The target type "${type} is not currently supported.`,

    'run-missing-file': () => dedent`
      file is required for vba-blocks run (e.g. vba-blocks run FILE MACRO [ARGS...]).`,

    'run-missing-macro': () => dedent`
      macro is required for vba-blocks run (e.g. vba-blocks run FILE MACRO [ARGS...]).`
  }
};

function plural(count: number, single: string, multiple: string): string {
  return count === 1 ? single : multiple;
}
