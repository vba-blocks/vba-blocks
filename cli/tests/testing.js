const { ensureDir } = require('fs-extra');
const Config = require('../src/config');
const { update } = require('../src/registry');
const { fetch, extractTo } = require('../src/packages');

async function main() {
  console.log('1. Loading config');
  const config = await Config.load();

  console.log('2. Updating registry');
  await update(config);

  console.log('3. Fetching package');
  const pkg = { name: 'dictionary', version: '1.4.1' };
  await fetch(config, pkg);

  console.log('4. Extracting package');
  const extracted = config.relativeToCache('extracted');
  await ensureDir(extracted);
  await extractTo(config, pkg, extracted);
}

main().catch(err => console.error(err.stack || err));
