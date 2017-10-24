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

export function getTargetInfo(
  project: Project,
  target: Target
): { application: Application; addin: Addin; file: string } {
  const application = getApplication(target);
  const addin = getAddin(target);
  const file = join(project.paths.build, `${target.name}.${target.type}`);

  return { application, addin, file };
}

export function getApplication(target: Target): Application {
  for (const [application, values] of Object.entries(extensions)) {
    if (values.includes(target.type)) return application;
  }

  throw new Error(`Unsupported target type "${target.type}"`);
}

export function getAddin(target: Target): Addin {
  const application = getApplication(target);
  return join(env.addins, addins[application]);
}
