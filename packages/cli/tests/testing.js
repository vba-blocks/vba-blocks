const { ensureDir } = require('fs-extra');
const Config = require('../lib/config');
const Registry = require('../lib/registry');
const { fetch, extract } = require('../lib/packages');

async function main() {
  console.time('Load + Update + Fetch + Extract');

  console.log('1. Loading config');
  const config = await Config.load();

  console.log('2. Updating registry');
  const registry = await Registry.update(config);

  console.log('3. Fetching package');
  const manifest = { metadata: { name: 'dictionary', version: '1.4.1' } };
  await fetch(config, manifest);

  console.log('4. Extracting package');
  await extract(config, manifest);

  console.timeEnd('Load + Update + Fetch + Extract');

  console.log('5. Get versions');
  const versions = await registry.getVersions('dictionary');
  console.log('versions', versions);
}

main().catch(err => console.error(err.stack || err));
