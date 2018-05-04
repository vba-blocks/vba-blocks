import { Project } from '../project';
import { Target } from '../manifest';
import { remove } from '../utils';
import { importGraph } from '../addin';
import { BuildOptions } from './build-target';
import { BuildGraph } from './build-graph';
import { createBuildGraph } from './build-graph';
import stageBuildGraph from './stage-build-graph';

export default async function importTarget(
  project: Project,
  target: Target,
  options: BuildOptions = {}
) {
  const graph = await createBuildGraph(project, options);
  const { staged, graph: staged_graph } = await stageBuildGraph(project, graph);

  await importGraph(project, target, staged_graph, options);

  if (staged) {
    await remove(staged);
  }
}
