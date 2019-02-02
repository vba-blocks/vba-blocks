import { Manifest, Target } from './manifest/types';
import { Sources } from './sources/types';
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

export interface Reporter {
  silent?: boolean;
  log: (message: string) => void;
  progress: (name: string) => Progress;
  messages: { [T in keyof Messages]: (values: Messages[T]) => string };
}

export interface Progress {
  start: (count?: number) => void;
  tick: () => void;
  done: () => void;
}

export type MessageId = keyof Messages;
