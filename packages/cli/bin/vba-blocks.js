const program = require('commander');
const { version } = require('../package.json');

program.version(version);

program
  .command('build')
  .description('Build project from src and dependencies')
  .option('--release', 'Build for release')
  .option(
    '--features <features>',
    'Space-separated list of features to build',
    list
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
    const build = require('../lib/build');

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

program.parse(process.argv);

function list(val) {
  return val.split(',');
}

function last(val) {
  return val[val.length - 1];
}
