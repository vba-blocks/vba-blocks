import { Manifest, Target } from './manifest/types';
import { Registration, Sources } from './sources/types';
import { DependencyGraph } from './resolve/types';

export type Application = 'excel';
export type Addin = string;

export interface AddinOptions {
  addin?: string;
  staging?: boolean;
}

export interface Workspace {
  root: Manifest;
  members: Manifest[];
}

export interface Project {
  manifest: Manifest;
  workspace: Workspace;
  packages: DependencyGraph;

  config: Config;
  paths: {
    root: string;
    dir: string;
    build: string;
    backup: string;
    staging: string;
  };
  has_dirty_lockfile: boolean;
}

export interface Env {
  isWindows: boolean;
  cwd: string;
  values: any;

  addins: string;
  scripts: string;
  bin: string;
  cache: string;
  registry: string;
  packages: string;
  sources: string;
  staging: string;

  reporter: Reporter;
  silent: boolean;
}

export type Registry = {} | { [name: string]: { index: string; packages: string } };

export interface Flags {}

export interface Config {
  registry: Registry;
  flags: Flags;
  sources: Sources;
}

export interface ConfigValue {
  registry?: Registry;
  flags?: Flags;
}

export interface Messages {
  'build-project-loading': {};
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
  'patch-add-reference': {};
  'patch-remove-reference': { name: string };
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
  'target-already-defined': {};
  'resolve-failed': { details?: string };
  'component-unrecognized': { path: string };
  'component-invalid-no-name': {};
  'run-script-not-found': { path: string };
  'new-name-required': {};
  'new-target-required': {};
  'new-dir-exists': { name: string; dir: string };
  'from-not-found': { from: string };
  'init-already-initialized': {};
  'init-name-required': {};
  'init-target-required': {};
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

export type MessageId = keyof Messages;

export type CliErrorCode = keyof ErrorMessages;

export interface CliErrorOptions {
  code?: CliErrorCode;
  underlying?: Error;
}
