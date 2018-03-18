import { join } from 'path';
import { pathExists } from '../utils/fs';
import { Project } from '../project';
import { Target, Source, Reference } from '../manifest';
import { importGraph } from '../addin';
import { targetNotFound, targetImportFailed } from '../errors';
import { getFile, getBackup } from './';
import backupTarget from './backup-target';
import createTarget from './create-target';
import restoreTarget from './restore-target';

export default async function buildTarget(
  project: Project,
  target: Target,
  graph: { src: Source[]; references: Reference[] }
) {
  if (!await pathExists(target.path)) {
    throw targetNotFound(target);
  }

  await backupTarget(project, target);
  await createTarget(project, target);

  try {
    await importGraph(project, target, graph);
  } catch (err) {
    await restoreTarget(project, target);
    throw targetImportFailed(target, err);
  }
}
