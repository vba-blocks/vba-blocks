import { join } from 'path';
import { pathExists } from '../utils/fs';
import { Project } from '../project';
import { Target, Source, Reference } from '../manifest';
import { importGraph } from '../addin';

export default async function buildTarget(
  project: Project,
  target: Target,
  graph: { src: Source[]; references: Reference[] }
) {
  const file = join(project.paths.build, `${target.name}.${target.type}`);
  if (!await pathExists(file)) {
    throw new Error(
      `Target binary for ${target.name}.${target.type} not found`
    );
  }

  await importGraph(project, target, graph);
}
