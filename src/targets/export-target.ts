import dedent from 'dedent/macro';
import { join, dirname } from '../utils/path';
import { copy, remove, ensureDir, pathExists } from '../utils/fs';
import { unzip } from '../utils/zip';
import {
  loadFromProject,
  loadFromExport,
  compareBuildGraphs,
  applyChangeset,
  toSrc
} from '../build';
import { filterTarget, mapTarget } from './transform-target';
import env from '../env';
import { CliError, ErrorCode } from '../errors';
import { Project } from '../project';
import { Target } from '../manifest/target';
import { ProjectInfo } from './project-info';

export interface ExportOptions {}

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
  await applyChangeset(project, changeset);

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
  let src = join(project.paths.build, target.filename);
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

  // For Mac, stage target to avoid permission prompts
  if (!env.isWindows) {
    const staged = join(staging, 'staged', target.filename);
    if (!(await pathExists(staged))) {
      await ensureDir(dirname(staged));
      await copy(src, staged);
    }

    src = staged;
  }

  await ensureDir(dest);
  await unzip(src, dest, { filter: filterTarget, map: mapTarget });

  return dest;
}
