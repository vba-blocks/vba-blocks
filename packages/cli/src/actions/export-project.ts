import { join } from 'path';
import { loadProject } from '../project';
import { exportTarget } from '../targets';
import { exportTo } from '../addin';
import { pathExists, tmpFolder, getStaging, nonce, isString } from '../utils';
import env from '../env';

export interface ExportOptions {
  completed?: string;
  _: string[];
}

export default async function exportProject(
  options: ExportOptions = { _: [] }
) {
  const { completed, _: [command, target_type] } = options;

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
    staging = env.isWindows
      ? await tmpFolder()
      : join(env.staging || (env.staging = await getStaging()), nonce(10));

    await exportTo(project, target, staging);
  } else {
    staging = completed;
  }

  await exportTarget(project, target, staging);
}
