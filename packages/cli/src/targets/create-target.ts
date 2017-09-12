import { join } from 'path';
import { exists, ensureDir } from 'fs-extra';
import { Config } from '../config';
import { Target } from '../manifest';
import { zip } from '../utils';

export default async function createTarget(config: Config, target: Target) {
  const dir = join(config.cwd, target.path);
  const file = join(config.build, `${target.name}.${target.type}`);

  if (!await exists(dir)) {
    throw new Error(
      `Path "${target.path}" not found for target "${target.name}"`
    );
  }

  await ensureDir(config.build);
  await zip(dir, file);
}
