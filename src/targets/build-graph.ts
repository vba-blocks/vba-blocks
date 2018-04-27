import { Source, Reference } from '../manifest';
import { Project, fetchDependencies, loadManifests } from '../project';
import { BuildOptions } from './build-target';

export interface BuildGraph {
  src: Source[];
  references: Reference[];
}

export async function createBuildGraph(
  project: Project,
  options: BuildOptions
): Promise<BuildGraph> {
  const src: Map<string, Source> = new Map();
  const references: Map<string, Reference> = new Map();

  const manifests = project.manifests || (await loadManifests(project));

  for (const manifest of manifests) {
    for (const source of manifest.src) {
      const { name } = source;
      if (src.has(name))
        throw new Error(`Conflicting source named "${source.name}"`);
      src.set(name, source);
    }
    for (const reference of manifest.references) {
      const { name, guid } = reference;
      if (references.has(name) && references.get(name)!.guid !== guid)
        throw new Error(`Conficting reference named "${reference.name}"`);
      references.set(name, reference);
    }
  }

  return { src: [...src.values()], references: [...references.values()] };
}
