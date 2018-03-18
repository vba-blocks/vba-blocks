import { Project } from '../project';
import { Target } from '../manifest';
import { getBackup, getFile } from './';
import { pathExists, copyFile } from '../utils';
import { targetRestoreFailed } from '../errors';

export default async function restoreTarget(project: Project, target: Target) {
  const backup = getBackup(project, target);
  const file = getFile(project, target);

  if (!await pathExists(backup)) return;

  try {
    await copyFile(backup, file);
  } catch (err) {
    throw targetRestoreFailed(backup, file, err);
  }
}
