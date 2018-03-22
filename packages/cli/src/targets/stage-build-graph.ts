import { basename } from 'path';
import { BuildGraph } from './build-graph';
import { getStaging, ensureDir, copyFile, parallel, unixJoin } from '../utils';
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

  const staging = env.staging || (env.staging = await getStaging());

  const src = await parallel(
    graph.src,
    async source => {
      const { name, path, optional } = source;

      const dest = unixJoin(staging, basename(source.path));
      await copyFile(source.path, dest);

      return { name, path: dest, optional, original: path };
    },
    { progress: env.reporter.progress('Staging dependencies') }
  );

  return Object.assign({}, graph, { src });
}
