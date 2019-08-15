import { join, dirname } from './utils/path';
import { ensureDir, pathExists, copy } from './utils/fs';
import run from './utils/run';
import env from './env';
import { CliError, ErrorCode } from './errors';
import { Target } from './manifest/target';
import { ImportGraph } from './build/build-graph';
import { Project } from './project';

export type Application = 'excel';
export type Addin = string;

export interface AddinOptions {
  addin?: string;
  staging?: boolean;
}

export const extensions: { [application: string]: string[] } = {
  excel: ['xlsx', 'xlsm', 'xlam']
};
export const addins: { [application: string]: string } = {
  excel: join(env.addins, 'vba-blocks.xlam')
};

const byExtension: { [extension: string]: string } = {};
for (const [application, values] of Object.entries(extensions)) {
  for (const extension of values) {
    byExtension[extension] = application;
  }
}

/**
 * Import graph of src and references into given target
 */
export async function importGraph(
  project: Project,
  target: Target,
  graph: ImportGraph,
  file: string,
  options: AddinOptions = {}
): Promise<void> {
  const { application, addin } = getTargetInfo(project, target);
  const { name, components, references } = graph;

  await run(application, options.addin || addin, 'Build.ImportGraph', [
    JSON.stringify({
      file,
      name,
      src: components,
      references
    })
  ]);
}

/**
 * Export src and references from given target
 */
export async function exportTo(
  project: Project,
  target: Target,
  staging: string,
  options: AddinOptions = {}
): Promise<void> {
  let { application, addin, file } = getTargetInfo(project, target);

  // For Mac, stage target to avoid permission prompts
  if (!env.isWindows) {
    const staged = join(staging, 'staged', target.filename);
    if (!(await pathExists(staged))) {
      await ensureDir(dirname(staged));
      await copy(file, staged);
    }

    file = staged;
  }

  await run(application, options.addin || addin, 'Build.ExportTo', [
    JSON.stringify({
      file,
      staging
    })
  ]);
}

/**
 * Create a new document at the given path
 */
export async function createDocument(
  project: Project,
  target: Target,
  options: AddinOptions = {}
): Promise<string> {
  const { application, addin, file } = getTargetInfo(project, target, options);

  // For Mac, stage target to avoid permission prompts and then copy to build directory
  const use_staging = !env.isWindows && !options.staging;
  let path = !use_staging ? file : join(project.paths.staging, target.filename);

  await ensureDir(dirname(path));
  await run(application, options.addin || addin, 'Build.CreateDocument', [
    JSON.stringify({
      path
    })
  ]);

  // For Mac, then copy staged to build directory
  if (use_staging) {
    await ensureDir(dirname(file));
    await copy(path, file);
  }

  return file;
}

/**
 * Get application, addin, and file for given target
 */
export function getTargetInfo(
  project: Project,
  target: Target,
  options: AddinOptions = {}
): { application: Application; addin: Addin; file: string } {
  const application = extensionToApplication(target.type);
  const addin = addins[application];
  const file = join(options.staging ? project.paths.staging : project.paths.build, target.filename);

  return { application, addin, file };
}

export function extensionToApplication(extension: string): Application {
  extension = extension.replace('.', '');
  const application = byExtension[extension];
  if (!application) {
    throw new CliError(
      ErrorCode.AddinUnsupportedType,
      `The target type "${extension} is not currently supported.`
    );
  }

  return <Application>application;
}
