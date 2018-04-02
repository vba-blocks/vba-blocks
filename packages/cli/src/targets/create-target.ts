import { ensureDir } from '../utils/fs';
import { Project } from '../project';
import { Target } from '../manifest';
import { zip } from '../utils';
import { getFile } from './';
import { targetCreateFailed } from '../errors';

export default async function createTarget(project: Project, target: Target) {
  const file = getFile(project, target);

  // Zip directory to create target
  try {
    await ensureDir(project.paths.build);
    await zip(target.path, file);
  } catch (err) {
    throw targetCreateFailed(target, err);
  }
}
