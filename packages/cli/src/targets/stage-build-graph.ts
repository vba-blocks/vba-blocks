import { BuildGraph } from './build-graph';
import env from '../env';

// To avoid "Grant File Access" prompts on Mac,
// files to be imported/exported from VBA are staged to
// a location that can freely share files with Office:
// "HOME/Library/Group Containers/##########.Office"
//
// See: http://www.rondebruin.nl/mac/mac034.htm

export default async function stageBuildGraph(
  graph: BuildGraph
): Promise<BuildGraph> {
  if (env.isWindows) return graph;

  // TODO
  // 1. Find .Office folder (default seems to be UBF8T346G9.Office)
  // 2. Ensure vba-blocks staging folder inside
  // 3. Add build graph files to staging folder
  // 4. Replace paths inside build graph

  return graph;
}
