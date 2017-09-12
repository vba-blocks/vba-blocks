import { optionList, last } from '../utils';
import { Config, loadConfig } from '../config';
import { BuildOptions } from '../actions/build';

export type Commander = any;
export type Build = (config: Config, options: BuildOptions) => Promise<void>;

export async function build(program: Commander) {
  program
    .command('build')
    .description('Build project from src and dependencies')
    .option('--release', 'Build for release')
    .option(
      '--features <features>',
      'Space-separated list of features to build',
      optionList
    )
    .option('--all-features', 'Build all available features')
    .option('--no-default-features', 'Do not build the `default` feature')
    .action(async (...args: any[]) => {
      const {
        release = false,
        features = [],
        allFeatures = false,
        defaultFeatures = true
      }: {
        release: boolean;
        features: string[];
        allFeatures: boolean;
        defaultFeatures: boolean;
      } = last(args);

      const build: Build = require('../actions/build').default;
      const config = await loadConfig();

      build(config, {
        release,
        features,
        allFeatures,
        defaultFeatures
      }).catch((err: Error) => {
        console.error(err);
        process.exit(1);
      });
    });
}
