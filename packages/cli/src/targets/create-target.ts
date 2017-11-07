import { join } from 'path';
import { pathExists, ensureDir, remove, move } from '../utils/fs';
import { Project } from '../project';
import { Target } from '../manifest';
import { zip } from '../utils';

export default async function createTarget(
  project: Project,
  target: Target
): Promise<string> {
  const file = join(project.paths.build, `${target.name}.${target.type}`);
  const backup = join(project.paths.backup, `${target.name}.${target.type}`);

  if (!await pathExists(target.path)) {
    throw new Error(
      `Path "${target.path}" not found for target "${target.name}"`
    );
  }

  // Backup file if target already exists
  if (await pathExists(backup)) await remove(backup);
  if (await pathExists(file)) {
    await ensureDir(project.paths.backup);
    await move(file, backup);
  }

  // Zip directory to create target
  await ensureDir(project.paths.build);
  await zip(target.path, file);

  return file;
}
