import dedent from 'dedent/macro';
import { createDocument, importGraph } from '../addin';
import { loadFromProject, stageBuildGraph } from '../build';
import { CliError, ErrorCode } from '../errors';
import { Target } from '../manifest/target';
import { Project } from '../project';
import { copy, emptyDir, ensureDir, move, pathExists, remove } from '../utils/fs';
import { join } from '../utils/path';
import { isRunError } from '../utils/run';
import { zip } from '../utils/zip';
import { ProjectInfo } from './project-info';

export interface BuildOptions {
  release?: boolean;
  target?: string;
  addin?: string;
}

const isCreateDocumentError = (message: string) => /1004/.test(message);
const targetIsOpen = (target: Target, file: string) => dedent`
  Failed to build target "${target.name}", it is currently open.

  Please close "${file}" and try again.
`;

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
  let staged;
  try {
    staged = !info.blank_target
      ? await createTarget(project, target)
      : await createDocument(project, target, { staging: true });
  } catch (error) {
    // Error "1004: Method 'CreateDocument' of object 'OfficeApplication' failed"
    // occurs when trying to create a document with the same name on Mac
    if (!isRunError(error) || !error.result.errors.some(isCreateDocumentError)) throw error;

    const file = join(project.paths.build, target.filename);
    throw new CliError(ErrorCode.TargetIsOpen, targetIsOpen(target, file));
  }

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
    throw new CliError(
      ErrorCode.TargetNotFound,
      `Target "${target.name}" not found at "${target.path}".`
    );
  }

  const file = join(project.paths.staging, target.filename);

  try {
    await ensureDir(project.paths.staging);
    await zip(target.path!, file);
  } catch (err) {
    throw new CliError(
      ErrorCode.TargetCreateFailed,
      `Failed to create project for target "${target.name}".`,
      err
    );
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

  const build_graph = await loadFromProject(project, dependencies, options);
  const import_graph = await stageBuildGraph(build_graph, staging);

  try {
    await importGraph(project, target, import_graph, file, options);
  } catch (err) {
    throw new CliError(
      ErrorCode.TargetImportFailed,
      `Failed to import project for target "${target.name}".`,
      err
    );
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
      throw new CliError(ErrorCode.TargetIsOpen, targetIsOpen(target, file));
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
    throw new CliError(
      ErrorCode.TargetRestoreFailed,
      dedent`
        Failed to automatically restore backup from "${backup}" to "${file}".

        The previous version can be moved back manually, if desired.
      `,
      err
    );
  }
}
