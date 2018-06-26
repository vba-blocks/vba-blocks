import { join } from './utils/path';
import run from './utils/run';
import env from './env';
import { Project } from './project';
import { Target } from './manifest';
import { ImportGraph } from './build';

export type Application = string;
export type Addin = string;

export interface AddinOptions {
  addin?: string;
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

  await run(application, options.addin || addin, 'Build.ImportGraph', {
    file,
    name,
    src: components,
    references
  });
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

  const result = await run(
    application,
    options.addin || addin,
    'Build.ExportTo',
    {
      file,
      staging
    }
  );
}

/**
 * Get application, addin, and file for given target
 */
export function getTargetInfo(
  project: Project,
  target: Target
): { application: Application; addin: Addin; file: string } {
  const application = byExtension[target.type];
  if (!application) throw new Error(`Unsupported target type "${target.type}"`);

  const addin = addins[application];
  const file = join(project.paths.build, target.filename);

  return { application, addin, file };
}
