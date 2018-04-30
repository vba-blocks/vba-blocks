import { join } from 'path';
import { loadProject } from '../project';
import { exportTarget } from '../targets';
import { exportTo } from '../addin';
import {
  unixJoin,
  pathExists,
  tmpFolder,
  emptyDir,
  isString,
  ensureDir
} from '../utils';
import env from '../env';

export interface ExportOptions {
  completed?: string;
  _: string[];
}

export default async function exportProject(
  options: ExportOptions = { _: [] }
) {
  const {
    completed,
    _: [command, target_type]
  } = options;

  if (!target_type) {
    throw new Error('target required for export');
  }

  const project = await loadProject({ manifests: true });
  const target = project.manifest.targets.find(
    target => target.type === target_type
  );

  if (!target) {
    throw new Error(`No target found for "${target_type}"`);
  }

  let staging: string;
  if (!completed) {
    staging = unixJoin(project.paths.staging, 'export');

    await ensureDir(staging);
    await emptyDir(staging);
    await exportTo(project, target, staging);
  } else {
    staging = completed;
  }

  await exportTarget(project, target, staging);
}
