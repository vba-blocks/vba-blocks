import { Project } from '../project';
import { Target } from '../manifest';
import { remove } from '../utils';
import { importGraph } from '../addin';
import { BuildOptions } from './build-target';
import { BuildGraph } from './build-graph';
import { createBuildGraph } from './build-graph';
import stageBuildGraph from './stage-build-graph';
import { ProjectInfo } from './build-target';

export default async function importTarget(
  target: Target,
  info: ProjectInfo,
  options: BuildOptions = {}
) {
  const { project, dependencies } = info;
  const graph = await createBuildGraph(project, dependencies, options);
  const { staged, graph: staged_graph } = await stageBuildGraph(project, graph);

  await importGraph(project, target, staged_graph, options);

  if (staged) {
    await remove(staged);
  }
}
