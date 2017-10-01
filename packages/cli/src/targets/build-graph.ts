import { Config } from '../config';
import { Project } from '../project';
import { Source, Reference } from '../manifest';
import { fetchDependencies } from '../resolve';

export interface BuildGraph {
  src: Source[];
  references: Reference[];
}

export interface BuildGraphOptions {}

export async function createBuildGraph(
  config: Config,
  project: Project,
  options: BuildGraphOptions
): Promise<BuildGraph> {
  await fetchDependencies(config, project.packages);

  const manifests = [project.manifest];
  for (const dependency of project.manifest.dependencies) {
    const registration = project.packages.find(
      value => value.name === dependency.name
    );
    if (!registration) throw new Error('No matching dependency found');

    manifests.push(registration.manifest);
  }

  const src: Map<string, Source> = new Map();
  const references: Map<string, Reference> = new Map();
  for (const manifest of manifests) {
    for (const source of manifest.src) {
      const { name } = source;
      if (src.has(name))
        throw new Error(`Conflicting source named "${source.name}"`);
      src.set(name, source);
    }
    for (const reference of manifest.references) {
      const { name } = reference;
      if (references.has(name))
        throw new Error(`Conficting reference named "${reference.name}"`);
      references.set(name, reference);
    }
  }

  return { src: [...src.values()], references: [...references.values()] };
}
