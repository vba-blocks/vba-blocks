import { Config } from '../config';

export interface Option {}

export interface Options {
  [name: string]: any;
}

export interface Command {
  description?: string;
  options?: Option[];
  action: (config: Config, options: Options) => void | Promise<void>;
}
