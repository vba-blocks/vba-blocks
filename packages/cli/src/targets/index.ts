import { join } from 'path';
import { Target } from '../manifest';
import { Project } from '../project';

export { default as createTarget } from './create-target';
export { default as buildTarget } from './build-target';

export function getFile(project: Project, target: Target): string {
  return join(project.paths.build, `${target.name}.${target.type}`);
}

export function getBackup(project: Project, target: Target): string {
  return join(project.paths.backup, `${target.name}.${target.type}`);
}
