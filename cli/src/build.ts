import { relative } from 'path';
import { exists, ensureDir } from 'fs-extra';
import { Config, loadConfig } from './config';
import { Manifest, Target, loadManifest } from './manifest';
import run from './run';
import { zip, plural } from './utils';

export default async function build(options) {
  console.log('1. Loading vba-blocks.toml and config');
  const [config, manifest] = await Promise.all([
    loadConfig(),
    loadManifest(process.cwd())
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
  for (const target of manifest.targets) {
    await createTarget(config, target);
    await buildTarget(target, files);
  }

  console.log('Done!');
}

async function createTarget(config: Config, target: Target) {
  const dir = relative(config.cwd, target.path);
  const file = relative(config.build, `${target.name}.${target.type}`);

  if (await exists(file)) {
    return;
  }

  return zip(dir, file);
}

async function buildTarget(target: Target, files: any[]) {
  return run('build', target, [JSON.stringify(files)]);
}
