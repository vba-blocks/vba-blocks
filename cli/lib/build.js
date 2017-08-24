const { exists, ensureDir } = require('fs-extra');
const Config = require('./config');
const Manifest = require('./manifest');
const run = require('./run');
const { zip, plural } = require('./utils');

module.exports = async function build(options) {
  console.log('1. Loading vba-blocks.toml and config');
  const [config, manifest] = await Promise.all([
    Config.load(),
    Manifest.load(process.cwd())
  ]);

  console.log('2. Resolving dependencies');
  // TODO Determine files to install
  const files = [];

  console.log(
    `3. Building ${manifest.targets.length} ${plural(
      manifest.targets.length,
      'target',
      'targets'
    )}`
  );

  await ensureDir(config.build);

  // Conservatively build targets sequentially
  // to avoid potential contention issues in add-ins
  for (const target in manifest.targets) {
    await createTarget(config, target);
    await buildTarget(target, files);
  }

  console.log('Done!');
};

async function createTarget(config, target) {
  const dir = config.relativeToCwd(target.path);
  const file = config.relativeToBuild(`${target.name}.${target.type}`);

  if (await exists(file)) {
    return;
  }

  return zip(dir, file);
}

function buildTarget(target, files) {
  return run('build', target, [JSON.stringify(files)]);
}
