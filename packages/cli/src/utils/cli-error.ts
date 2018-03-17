export interface CliErrorOptions {
  original?: string | Error;
}

export default class CliError extends Error {
  original?: string | Error;

  constructor(message: string, options: CliErrorOptions = {}) {
    super(message);
    this.original = options.original;
  }
}
