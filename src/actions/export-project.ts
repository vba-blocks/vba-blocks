import { Target } from '../manifest';
import { loadProject, fetchDependencies } from '../project';
import { exportTarget } from '../targets';
import { exportTo } from '../addin';
import { join, sanitize } from '../utils/path';
import { emptyDir, ensureDir } from '../utils/fs';
import { exportNoDefault, exportNoMatching } from '../errors';
import { TargetType } from '../manifest/target';
import env from '../env';
import {
  exportLoadingProject,
  exportToStaging,
  exportToProject
} from '../messages';

export interface ExportOptions {
  target?: string;
  completed?: string;
  addin?: string;
}

export default async function exportProject(options: ExportOptions = {}) {
  env.reporter.log(exportLoadingProject());

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
    const type = <TargetType>options.target;
    const name = project.manifest.name;

    target = {
      type,
      name,
      path: `targets/${type}`,
      filename: `${sanitize(name)}.${type}`,
      blank: true
    };
  }

  if (!target) {
    throw exportNoMatching(options.target!);
  }

  const dependencies = await fetchDependencies(project);
  let staging: string;

  if (!options.completed) {
    staging = join(project.paths.staging, 'export');

    env.reporter.log(exportToStaging(target));

    await ensureDir(staging);
    await emptyDir(staging);
    await exportTo(project, target, staging, options);
  } else {
    staging = options.completed;
  }

  env.reporter.log(exportToProject());
  await exportTarget(target, { project, dependencies }, staging);
}
