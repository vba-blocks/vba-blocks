import { join, basename } from 'path';
import { Source, Reference } from '../manifest';
import { BuildGraph } from './build-graph';
import { parallel, writeFile, copy } from '../utils';
import env from '../env';

export interface ImportGraph {
  name: string;
  components: Source[];
  references: Reference[];
}

export async function stageBuildGraph(
  graph: BuildGraph,
  staging: string
): Promise<ImportGraph> {
  const components = await parallel(
    graph.components,
    async component => {
      const path = join(staging, component.filename);
      await writeFile(path, component.code);

      if (component.binary_path) {
        const binary_path = join(staging, basename(component.binary_path));
        await writeFile(binary_path, component.binary);
      }

      return { name: component.name, path };
    },
    { progress: env.reporter.progress('Stage build graph') }
  );

  return {
    name: graph.name,
    components,
    references: graph.references
  };
}
