import { optionList, last } from '../utils';
import { Config, loadConfig } from '../config';
import { BuildOptions } from '../actions/build';

export type Commander = any;
export type Build = (config: Config, options: BuildOptions) => Promise<void>;

export default function build(program: Commander) {
  program
    .command('build')
    .description('Build project from src and dependencies')
    .action(async (...args: any[]) => {
      const options: {} = last(args);
      const build: Build = require('../actions/build').default;
      const config = await loadConfig();

      build(config, options).catch((err: Error) => {
        console.error(err);
        process.exit(1);
      });
    });
}
