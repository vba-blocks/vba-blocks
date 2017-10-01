import { Config } from '../config';
import { Source, Reference } from '../manifest';
import { Project, loadProject, fetchDependencies } from '../project';
import { createTarget, buildTarget } from '../targets';
import { writeLockfile } from '../lockfile';

export interface BuildOptions {}
const defaultOptions = {};

export default async function build(config: Config, options: BuildOptions) {
  options = { ...defaultOptions, ...options };

  // 1. Load and fetch project
  const project = await loadProject(config);

  // 2. Determine src and references for build
  const buildGraph = await createBuildGraph(config, project, options);

  // 3. Create and build targets (sequentially to avoid contention issues)
  for (const target of project.manifest.targets) {
    await createTarget(config, target);
    await buildTarget(config, target, buildGraph);
  }

  // 3. On success, write lockfile
  await writeLockfile(config, project);
}

export interface BuildGraph {
  src: Source[];
  references: Reference[];
}

export async function createBuildGraph(
  config: Config,
  project: Project,
  options: BuildOptions
): Promise<BuildGraph> {
  const src: Map<string, Source> = new Map();
  const references: Map<string, Reference> = new Map();

  const manifests = [
    project.manifest,
    ...(await fetchDependencies(config, project))
  ];

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
