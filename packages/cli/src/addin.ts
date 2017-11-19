import { join } from 'path';
import env from './env';
import { Project } from './project';
import { Target, Source, Reference } from './manifest';
import { run } from './utils';

export type Application = string;
export type Addin = string;

const extensions: { [application: string]: string[] } = {
  excel: ['xlsx', 'xlsm', 'xlam']
};
const addins: { [application: string]: string } = {
  excel: 'vba-blocks.xlam'
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

  await run(project.config, application, addin, 'ImportGraph', {
    file,
    src,
    references
  });
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

  const addin = join(env.addins, addins[application]);
  const file = join(project.paths.build, `${target.name}.${target.type}`);

  return { application, addin, file };
}
