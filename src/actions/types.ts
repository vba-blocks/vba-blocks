import { TargetType } from '../manifest/types';

export interface CreateOptions {
  name: string;
  target?: string;
  from?: string;
  pkg: boolean;
  git: boolean;
}

export interface ExportOptions {
  target?: string;
  completed?: string;
  addin?: string;
}

export interface InitOptions {
  name?: string;
  dir?: string;
  target?: string;
  from?: string;
  pkg: boolean;
  git: boolean;
}

export interface RunOptions {
  target?: string;
  file?: string;
  macro: string;
  args: string[];
}

export interface AddOptions {
  type: TargetType;
  from?: string;
  name?: string;
  path?: string;
}
