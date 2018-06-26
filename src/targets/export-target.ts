import walk from 'walk-sync';
import { Target } from '../manifest';
import { Project } from '../project';
import { join, extname } from '../utils/path';
import { copy, remove, ensureDir, pathExists } from '../utils/fs';
import { unzip } from '../utils/zip';
import { ProjectInfo } from './build-target';
import { readBuildGraph } from '../build';
import exportBuildGraph from '../build/export-build-graph';

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
  staging: string
) {
  const { project, dependencies } = info;

  // Extract target to staging
  const extracted = await extractTarget(project, target, staging);

  // Read build graph from staging, then export
  const graph = await readBuildGraph(staging);
  await exportBuildGraph(project, dependencies, graph);

  // Move target to dest
  await remove(target.path);
  await copy(extracted, target.path);

  // Finally, cleanup staging
  await remove(staging);
}

export async function extractTarget(
  project: Project,
  target: Target,
  staging: string
): Promise<string> {
  const src = join(project.paths.build, target.filename);
  const dest = join(staging, 'targets', target.type);

  if (!(await pathExists(src))) {
    throw new Error(
      `Could not find built target for type "${
        target.type
      }".\n(checked "${src}")`
    );
  }

  await ensureDir(dest);
  await unzip(src, dest);

  // Remove compiled VBA from dest
  const extracted = walk(dest, { directories: false });
  const compiled = extracted
    .filter(file => extname(file) === '.bin')
    .map(file => join(dest, file));

  await Promise.all(compiled.map(async file => await remove(file)));

  return dest;
}
