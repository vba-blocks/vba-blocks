const { exists, ensureDir } = require('fs-extra');
const tar = require('tar');
const { download } = require('./utils');

async function fetch(config, manifest) {
  const { name, version } = manifest.metadata;
  const dest = config.packagePath(manifest);

  if (!await exists(dest)) {
    await download(config.resolve(name, version), dest);
  }
}

async function extract(config, manifest) {
  await fetch(config, manifest);

  const file = config.packagePath(manifest);
  const dest = config.sourcePath(manifest);

  await ensureDir(dest);
  await tar.extract({ file, cwd: dest });
}

module.exports = { fetch, extract };
