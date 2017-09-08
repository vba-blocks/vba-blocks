import { optionList, last } from '../utils';

export async function build(program) {
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
    .action((...args) => {
      const {
        release = false,
        features = [],
        allFeatures = false,
        defaultFeatures = true
      } = last(args);

      const build = require('../actions/build');

      build({
        release,
        features,
        allFeatures,
        defaultFeatures
      }).catch(err => {
        console.error(err);
        process.exit(1);
      });
    });
}
