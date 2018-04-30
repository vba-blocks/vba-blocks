import { basename } from 'path';
import { Project } from '../project';
import { BuildGraph } from './build-graph';
import { ensureDir, copyFile, parallel, unixJoin, emptyDir } from '../utils';
import env from '../env';

// To avoid "Grant File Access" prompts on Mac,
// files to be imported/exported from VBA are staged to
// a location that can freely share files with Office:
// "HOME/Library/Group Containers/##########.Office"
//
// See: http://www.rondebruin.nl/mac/mac034.htm

export default async function stageBuildGraph(
  project: Project,
  graph: BuildGraph
): Promise<{ staged: string | null; graph: BuildGraph }> {
  if (env.isWindows) return { staged: null, graph };

  const staged = unixJoin(project.paths.staging, 'import');
  await ensureDir(staged);
  await emptyDir(staged);

  const src = await parallel(
    graph.src,
    async source => {
      const { name, path, optional } = source;

      const dest = unixJoin(staged, basename(source.path));
      await copyFile(source.path, dest);

      return { name, path: dest, optional, original: path };
    },
    { progress: env.reporter.progress('Staging dependencies') }
  );

  return { staged, graph: { ...graph, src } };
}
