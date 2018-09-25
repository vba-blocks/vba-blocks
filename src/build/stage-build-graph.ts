import { Source, Reference } from '../manifest';
import { BuildGraph } from './build-graph';
import { join, basename } from '../utils/path';
import { writeFile } from '../utils/fs';
import parallel from '../utils/parallel';

export interface ImportGraph {
  name: string;
  components: Source[];
  references: Reference[];
}

export default async function stageBuildGraph(
  graph: BuildGraph,
  staging: string
): Promise<ImportGraph> {
  const components = await parallel(graph.components, async component => {
    const path = join(staging, component.filename);
    await writeFile(path, component.code);

    if (component.binary_path) {
      const binary_path = join(staging, basename(component.binary_path));
      await writeFile(binary_path, component.details.binary);
    }

    return { name: component.name, path };
  });

  return {
    name: graph.name,
    components,
    references: graph.references
  };
}
