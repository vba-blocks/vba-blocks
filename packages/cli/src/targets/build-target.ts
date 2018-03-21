import { pathExists } from '../utils/fs';
import { Project } from '../project';
import { Target } from '../manifest';
import { targetNotFound, targetImportFailed } from '../errors';
import { getFile, getBackup } from './';
import { BuildGraph } from './build-graph';
import backupTarget from './backup-target';
import createTarget from './create-target';
import importTarget from './import-target';
import restoreTarget from './restore-target';

export default async function buildTarget(
  project: Project,
  target: Target,
  graph: BuildGraph
) {
  if (!await pathExists(target.path)) {
    throw targetNotFound(target);
  }

  await backupTarget(project, target);
  await createTarget(project, target);

  try {
    await importTarget(project, target, graph);
  } catch (err) {
    await restoreTarget(project, target);
    throw targetImportFailed(target, err);
  }
}
