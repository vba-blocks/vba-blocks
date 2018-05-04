import { Project } from '../project';
import { Target } from '../manifest';
import { pathExists, ensureDir, remove, move, unixJoin } from '../utils';
import { targetIsOpen } from '../errors';

export default async function backupTarget(project: Project, target: Target) {
  const backup = unixJoin(project.paths.backup, target.filename);
  const file = unixJoin(project.paths.build, target.filename);

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
