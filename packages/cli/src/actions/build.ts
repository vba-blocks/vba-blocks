import { Source, Reference } from '../manifest';
import { Project, loadProject, fetchDependencies } from '../project';
import { createTarget, buildTarget } from '../targets';
import { writeLockfile } from '../lockfile';

export interface BuildOptions {}

export default async function build(options: BuildOptions = {}) {
  // 1. Load and fetch project
  const project = await loadProject();

  // 2. Determine src and references for build
  const buildGraph = await createBuildGraph(project, options);

  // 3. Create and build targets (sequentially to avoid contention issues)
  for (const target of project.manifest.targets) {
    await createTarget(project, target);
    await buildTarget(project, target, buildGraph);
  }

  // 3. On success, write lockfile
  await writeLockfile(project.workspace.root.dir, project);
}

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

  const manifests = [project.manifest, ...(await fetchDependencies(project))];

  for (const manifest of manifests) {
    for (const source of manifest.src) {
      const { name } = source;
      if (src.has(name))
        throw new Error(`Conflicting source named "${source.name}"`);
      src.set(name, source);
    }
    for (const reference of manifest.references) {
      const { name } = reference;
      if (references.has(name) && reference.guid !== references.get(name).guid)
        throw new Error(`Conficting reference named "${reference.name}"`);
      references.set(name, reference);
    }
  }

  return { src: [...src.values()], references: [...references.values()] };
}
