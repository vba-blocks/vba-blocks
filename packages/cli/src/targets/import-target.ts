import { Project } from '../project';
import { Target } from '../manifest';
import { importGraph } from '../addin';
import { BuildGraph } from './build-graph';
import stageBuildGraph from './stage-build-graph';

export default async function importTarget(
  project: Project,
  target: Target,
  graph: BuildGraph
) {
  graph = await stageBuildGraph(graph);
  await importGraph(project, target, graph);
}
