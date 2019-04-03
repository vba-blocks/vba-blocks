import dedent from 'dedent/macro';
import { join } from '../utils/path';
import { copy, remove, ensureDir, pathExists } from '../utils/fs';
import { unzip } from '../utils/zip';
import {
  loadFromProject,
  loadFromExport,
  compareBuildGraphs,
  applyChangeset,
  toSrc
} from '../build';
import transformTarget from './transform-target';
import { CliError, ErrorCode } from '../errors';

import { Project } from '../types';
import { Target } from '../manifest/types';
import { ExportOptions, ProjectInfo } from './types';

/**
 * Export target (with staging directory)
 *
 * 1. Export source from target to staging (done previously)
 * 2. Extract target to staging
 * 3. Export build graph to src
 * 4. Move extracted to target to src
 */
export default async function exportTarget(
  target: Target,
  info: ProjectInfo,
  staging: string,
  options: ExportOptions = {}
) {
  const { project, dependencies } = info;
  const { __temp__log_patch = true } = options;

  // Extract target to staging
  let extracted: string;
  if (!target.blank) {
    extracted = await extractTarget(project, target, staging);
  }

  // Compare project and exported and apply changes to project
  const project_build_graph = await loadFromProject(project, dependencies);
  const exported_build_graph = await loadFromExport(staging);
  const transformed_build_graph = await toSrc(exported_build_graph);

  const changeset = compareBuildGraphs(project_build_graph, transformed_build_graph);
  await applyChangeset(project, changeset, { __temp__log_patch });

  // Move target to dest
  if (!target.blank) {
    await remove(target.path);
    await copy(extracted!, target.path);
  }

  // Finally, cleanup staging
  await remove(staging);
}

export async function extractTarget(
  project: Project,
  target: Target,
  staging: string
): Promise<string> {
  const src = join(project.paths.build, target.filename);
  const dest = join(staging, 'target');

  if (!(await pathExists(src))) {
    throw new CliError(
      ErrorCode.ExportTargetNotFound,
      dedent`
        Could not find built target for type "${target.type}"
        (checked "${src}").
      `
    );
  }

  await ensureDir(dest);
  await unzip(src, dest, { plugins: [transformTarget()] });

  return dest;
}
