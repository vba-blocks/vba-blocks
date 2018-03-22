import { Project } from '../project';
import { Target } from '../manifest';
import { importGraph } from '../addin';
import { BuildOptions } from './build-target';
import { BuildGraph } from './build-graph';
import { createBuildGraph } from './build-graph';
import stageBuildGraph from './stage-build-graph';

export default async function importTarget(
  project: Project,
  target: Target,
  options: BuildOptions
) {
  const graph = await createBuildGraph(project, options);
  const staged = await stageBuildGraph(graph);

  await importGraph(project, target, staged);
}
