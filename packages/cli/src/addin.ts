import env from './env';
import { Project } from './project';
import { Target, Source, Reference } from './manifest';
import { run, unixJoin } from './utils';

export type Application = string;
export type Addin = string;

export const extensions: { [application: string]: string[] } = {
  excel: ['xlsx', 'xlsm', 'xlam']
};
export const addins: { [application: string]: string } = {
  excel: 'vba-blocks.xlsm' // TEMP vba-blocks.xlam
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
  graph: { src: Source[]; references: Reference[] }
): Promise<void> {
  const { application, addin, file } = getTargetInfo(project, target);
  const { src, references } = graph;

  await run(application, addin, 'Build.ImportGraph', {
    file,
    src,
    references
  });
}

/**
 * Export src and references from given target
 */
export async function exportTo(
  project: Project,
  target: Target,
  staging: string
): Promise<void> {
  const { application, addin, file } = getTargetInfo(project, target);

  const result = await run(application, addin, 'Build.ExportTo', {
    file,
    staging
  });
  console.log('export result', result);
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

  const addin = unixJoin(env.addins, addins[application]);
  const file = unixJoin(project.paths.build, target.filename);

  return { application, addin, file };
}
