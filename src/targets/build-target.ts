import { pathExists } from '../utils/fs';
import { Project } from '../project';
import { Manifest, Target } from '../manifest';
import { targetNotFound, targetImportFailed } from '../errors';
import { BuildGraph } from './build-graph';
import backupTarget from './backup-target';
import createTarget from './create-target';
import importTarget from './import-target';
import restoreTarget from './restore-target';

export interface BuildOptions {
  addin?: string;
}

export interface ProjectInfo {
  project: Project;
  dependencies: Manifest[];
}

export default async function buildTarget(
  target: Target,
  info: ProjectInfo,
  options: BuildOptions
) {
  const { project } = info;

  if (!(await pathExists(target.path))) {
    throw targetNotFound(target);
  }

  await backupTarget(project, target);
  await createTarget(project, target);

  try {
    await importTarget(target, info, options);
  } catch (err) {
    await restoreTarget(project, target);
    throw targetImportFailed(target, err);
  }
}
