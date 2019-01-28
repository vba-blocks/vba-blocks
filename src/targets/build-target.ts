import { Project } from '../project';
import { Manifest, Target } from '../manifest';
import {
  targetImportFailed,
  targetIsOpen,
  targetCreateFailed,
  targetRestoreFailed,
  targetNotFound
} from '../errors';
import { importGraph, createDocument } from '../addin';
import { loadFromProject, stageBuildGraph } from '../build';
import { join } from '../utils/path';
import { pathExists, ensureDir, remove, move, emptyDir, copy } from '../utils/fs';
import { zip } from '../utils/zip';

export interface BuildOptions {
  target?: string;
  addin?: string;
}

export interface ProjectInfo {
  project: Project;
  dependencies: Manifest[];
}

/**
 * Build target:
 *
 * 1. Create fresh target in staging
 * 2. Import project
 * 3. Backup previously built target
 * 4. Move built target to build
 */
export default async function buildTarget(
  target: Target,
  info: ProjectInfo,
  options: BuildOptions = {}
) {
  const { project } = info;

  // Build fresh target in staging directory
  // (for no target path, create blank target)
  const staged = !target.blank
    ? await createTarget(project, target)
    : await createDocument(project, target, { staging: true });

  await importTarget(target, info, staged, options);

  // Backup and move from staging to build directory
  try {
    await backupTarget(project, target);

    const dest = join(project.paths.build, target.filename);
    await move(staged, dest);
  } catch (err) {
    await restoreTarget(project, target);
    throw err;
  } finally {
    await remove(staged);
  }
}

/**
 * Create target binary
 */
export async function createTarget(project: Project, target: Target): Promise<string> {
  if (!(await pathExists(target.path))) {
    throw targetNotFound(target);
  }

  const file = join(project.paths.staging, target.filename);

  try {
    await ensureDir(project.paths.staging);
    await zip(target.path!, file);
  } catch (err) {
    throw targetCreateFailed(target, err);
  }

  return file;
}

/**
 * Import project into target
 *
 * 1. Create "import" staging directory
 * 2. Load build graph for project
 * 3. Stage build graph
 * 4. Import staged build graph
 */
export async function importTarget(
  target: Target,
  info: ProjectInfo,
  file: string,
  options: BuildOptions = {}
) {
  const { project, dependencies } = info;

  const staging = join(project.paths.staging, 'import');
  await ensureDir(staging);
  await emptyDir(staging);

  const build_graph = await loadFromProject(project, dependencies);
  const import_graph = await stageBuildGraph(build_graph, staging);

  try {
    await importGraph(project, target, import_graph, file, options);
  } catch (err) {
    throw targetImportFailed(target, err);
  } finally {
    await remove(staging);
  }
}

/**
 * Backup previously built target (if available)
 *
 * - Removes previous backup (if found)
 * - Attempts move, if that fails, it is assumed that the file is open
 */
export async function backupTarget(project: Project, target: Target) {
  const backup = join(project.paths.backup, target.filename);
  const file = join(project.paths.build, target.filename);

  if (await pathExists(backup)) await remove(backup);
  if (await pathExists(file)) {
    await ensureDir(project.paths.backup);

    try {
      await move(file, backup);
    } catch (err) {
      throw targetIsOpen(target, file);
    }
  }
}

/**
 * Restore previously built target (if available)
 */
export async function restoreTarget(project: Project, target: Target) {
  const backup = join(project.paths.backup, target.filename);
  const file = join(project.paths.build, target.filename);

  if (!(await pathExists(backup))) return;

  try {
    await copy(backup, file);
  } catch (err) {
    throw targetRestoreFailed(backup, file, err);
  }
}
