import { Project } from '../project';
import { Target } from '../manifest';
import { getBackup, getFile } from './';
import { pathExists, ensureDir, remove, move } from '../utils';
import { targetIsOpen } from '../errors';

export default async function backupTarget(project: Project, target: Target) {
  const backup = getBackup(project, target);
  const file = getFile(project, target);

  if (await pathExists(backup)) await remove(backup);
  if (await pathExists(file)) {
    await ensureDir(project.paths.backup);

    try {
      await move(file, backup);
    } catch (err) {
      throw targetIsOpen(target, file);
    }
  }
}
