import { join, dirname } from './utils/path';
import { ensureDir } from './utils/fs';
import run from './utils/run';
import env from './env';
import { Project } from './project';
import { Target } from './manifest';
import { ImportGraph } from './build';
import { addinUnsupportedType } from './errors';

export type Application = string;
export type Addin = string;

export interface AddinOptions {
  addin?: string;
  staging?: boolean;
}

export const extensions: { [application: string]: string[] } = {
  excel: ['xlsx', 'xlsm', 'xlam']
};
export const addins: { [application: string]: string } = {
  excel: join(env.addins, 'vba-blocks.xlsm') // TEMP vba-blocks.xlam
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

  await run(
    application,
    options.addin || addin,
    'Build.ImportGraph',
    JSON.stringify({
      file,
      name,
      src: components,
      references
    })
  );
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
  const { application, addin, file } = getTargetInfo(project, target);

  await run(
    application,
    options.addin || addin,
    'Build.ExportTo',
    JSON.stringify({
      file,
      staging
    })
  );
}

/**
 * Create a new document at the given path
 */
export async function createDocument(
  project: Project,
  target: Target,
  options: AddinOptions = {}
): Promise<string> {
  const { application, addin, file: path } = getTargetInfo(
    project,
    target,
    options
  );

  await ensureDir(dirname(path));
  await run(
    application,
    options.addin || addin,
    'Build.CreateDocument',
    JSON.stringify({
      path
    })
  );

  return path;
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
  const file = join(
    options.staging ? project.paths.staging : project.paths.build,
    target.filename
  );

  return { application, addin, file };
}

export function extensionToApplication(extension: string): string {
  extension = extension.replace('.', '');
  const application = byExtension[extension];
  if (!application) throw addinUnsupportedType(extension);

  return application;
}
