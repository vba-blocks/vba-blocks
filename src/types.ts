import { Manifest } from './manifest/types';
import { Sources } from './sources/types';
import { DependencyGraph } from './resolve/types';
import { Message } from './messages';

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

  data: string;
  config: string;
  cache: string;
  log: string;
  temp: string;

  addins: string;
  scripts: string;
  bin: string;
  registry: string;
  packages: string;
  sources: string;
  staging: string;

  reporter: Reporter;
  debug: (id: string) => (...values: any[]) => void;
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

export interface Reporter {
  silent?: boolean;
  log: (id: Message, message: string) => void;
  progress: (name: string) => Progress;
}

export interface Progress {
  start: (count?: number) => void;
  tick: () => void;
  done: () => void;
}
