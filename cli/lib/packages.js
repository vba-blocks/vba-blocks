const { exists } = require('fs-extra');
const tar = require('tar');
const { download } = require('./utils');

const cachePath = (config, pkg) =>
  config.relativeToCache(`packages/${pkg.name}/v${pkg.version}.tar.gz`);

async function fetch(config, pkg) {
  const { name, version } = pkg;
  const dest = cachePath(config, pkg);

  if (!await exists(dest)) {
    console.log('  - downloading');
    await download(config.resolve(name, version), dest);
  }
}

async function extractTo(config, pkg, dest) {
  await fetch(config, pkg);

  const file = cachePath(config, pkg);
  await tar.extract({ file, cwd: dest });
}

module.exports = { fetch, extractTo };
