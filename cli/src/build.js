const fs = require('fs');
const Config = require('./config');
const Manifest = require('./manifest');
const zip = require('./zip');
const run = require('./run');

module.exports = function build(options) {
  return Promise.all([
    Config.load(),
    Manifest.load(process.cwd()),
  ]).then(([config, manifest]) => {
    // TODO Determine files to install

    if (!fs.existsSync(config.build)) {
      fs.mkdirSync(config.build);
    }

    const building = manifest.targets.map(target => {
      return zip(
        config.relativeToCwd(target.path),
        config.relativeToBuild(`${target.name}.${target.type}`)
      ).then(() => {
        run(/* TODO */);  
      });
    });

    return Promise.all(building);
  });
};
