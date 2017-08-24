const { exists, ensureDir } = require('fs-extra');
const { clone, pull } = require('./utils/git');

async function update(config) {
  const local = config.relativeToCache('registry');

  if (!await exists(local)) {
    console.log('  - cloning');
    await ensureDir(config.cache);
    await clone(config.registry, 'registry', config.cache);
  }

  console.log('  - pulling');
  await pull(local);
}

module.exports = { update };
