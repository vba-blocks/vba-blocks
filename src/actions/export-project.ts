import { loadProject, fetchDependencies } from '../project';
import { exportTarget } from '../targets';
import { exportTo } from '../addin';
import { join } from '../utils/path';
import { emptyDir, ensureDir } from '../utils/fs';

export interface ExportOptions {
  target: string;
  completed?: string;
  addin?: string;
}

export default async function exportProject(options: ExportOptions) {
  if (!options || !options.target) {
    // TODO official error
    throw new Error('target required for export');
  }

  const { target: target_type, completed } = options;

  const project = await loadProject();
  const dependencies = await fetchDependencies(project);
  const target = project.manifest.targets.find(
    target => target.type === target_type
  );

  if (!target) {
    throw new Error(`No target found for "${target_type}"`);
  }

  let staging: string;
  if (!completed) {
    staging = join(project.paths.staging, 'export');

    await ensureDir(staging);
    await emptyDir(staging);
    await exportTo(project, target, staging, options);
  } else {
    staging = completed;
  }

  await exportTarget(target, { project, dependencies }, staging);
}
