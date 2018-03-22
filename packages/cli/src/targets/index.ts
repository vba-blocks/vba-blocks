import { unixJoin } from '../utils';
import { Target } from '../manifest';
import { Project } from '../project';

export { BuildGraph, createBuildGraph } from './build-graph';
export { default as stageBuildGraph } from './stage-build-graph';

export { default as backupTarget } from './backup-target';
export { BuildOptions, default as buildTarget } from './build-target';
export { default as createTarget } from './create-target';
export { default as importTarget } from './import-target';
export { default as restoreTarget } from './restore-target';

export function getFile(project: Project, target: Target): string {
  return unixJoin(project.paths.build, `${target.name}.${target.type}`);
}

export function getBackup(project: Project, target: Target): string {
  return unixJoin(project.paths.backup, `${target.name}.${target.type}`);
}
