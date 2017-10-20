export interface Option {}
export interface Options {
  [name: string]: any;
}

export interface Command {
  description?: string;
  options?: Option[];
  action: (options: Options) => void | Promise<void>;
}
