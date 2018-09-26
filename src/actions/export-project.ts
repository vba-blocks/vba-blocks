import { Target } from '../manifest';
import { loadProject, fetchDependencies } from '../project';
import { exportTarget } from '../targets';
import { exportTo } from '../addin';
import { join } from '../utils/path';
import { emptyDir, ensureDir } from '../utils/fs';
import { exportNoDefault, exportNoMatching } from '../errors';

export interface ExportOptions {
  target?: string;
  completed?: string;
  addin?: string;
}

export default async function exportProject(options: ExportOptions = {}) {
  const project = await loadProject();

  if (!options.target && !project.manifest.target) {
    throw exportNoDefault();
  }

  let target: Target | undefined;
  if (project.manifest.target) {
    if (!options.target || options.target === project.manifest.target.type) {
      target = project.manifest.target;
    }
  } else if (project.manifest.targets) {
    target = project.manifest.targets.find(
      target => target.type === options.target
    );
  } else {
    // TODO Load target from blank target
  }

  if (!target) {
    throw exportNoMatching(options.target!);
  }

  const dependencies = await fetchDependencies(project);
  let staging: string;

  if (!options.completed) {
    staging = join(project.paths.staging, 'export');

    await ensureDir(staging);
    await emptyDir(staging);
    await exportTo(project, target, staging, options);
  } else {
    staging = options.completed;
  }

  await exportTarget(target, { project, dependencies }, staging);
}
