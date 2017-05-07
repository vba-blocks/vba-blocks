const fs = require('fs');
const Config = require('./config');
const Manifest = require('./manifest');
const zip = require('./zip');
const run = require('./run');

module.exports = function build(options) {
  console.log('1. Loading vba-blocks.toml and config');
  return Promise.all([
    Config.load(),
    Manifest.load(process.cwd()),
  ])
    .then(([config, manifest]) => {
      console.log('2. Resolving dependencies');

      // TODO Determine files to install
      const files = [];

      console.log(`3. Building ${manifest.targets.length} target${manifest.targets.length === 1 ? '' : 's'}`);

      if (!fs.existsSync(config.build)) {
        fs.mkdirSync(config.build);
      }

      // Conservatively build targets in series
      // to avoid potential contention issues in add-ins
      return series(manifest.targets, target => {
        return createTarget(config, target)
          .then(() => buildTarget(target, files));
      });
    })
    .then(() => console.log('Done!'));
};

function createTarget(config, target) {
  const dir = config.relativeToCwd(target.path);
  const file = config.relativeToBuild(`${target.name}.${target.type}`);

  if (fs.existsSync(file)) {
    return Promise.resolve();
  }

  return zip(dir, file);
}

function buildTarget(target, files) {
  return run('build', target, [JSON.stringify(files)]);
}

function series(values, fn) {
  return values.reduce((chain, value, i) => {
    return chain.then(() => fn(value, i, values));
  }, Promise.resolve());
}
