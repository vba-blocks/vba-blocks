import { join } from 'path';
import { promisify } from 'util';
import { pathExists, ensureDir, remove } from 'fs-extra';
import { Config } from '../config';
import { Target } from '../manifest';
import { zip } from '../utils';
const copyFile = promisify(require('fs').copyFile);

export default async function createTarget(
  config: Config,
  target: Target
): Promise<string> {
  const dir = join(config.cwd, target.path);
  const file = join(config.build, `${target.name}.${target.type}`);
  const backup = join(config.build, '.backup', `${target.name}.${target.type}`);

  if (!await pathExists(dir)) {
    throw new Error(
      `Path "${target.path}" not found for target "${target.name}"`
    );
  }

  // Backup file if target already exists
  if (await pathExists(backup)) await remove(backup);
  if (await pathExists(file)) {
    await copyFile(file, backup);
    await remove(file);
  }

  // Zip directory to create target
  await ensureDir(config.build);
  await zip(dir, file);

  return file;
}
