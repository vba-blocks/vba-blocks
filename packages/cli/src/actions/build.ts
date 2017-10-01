import { Config } from '../config';
import { Project, loadProject } from '../project';
import { Manifest, Target, Source, Reference, loadManifest } from '../manifest';
import resolve, { DependencyGraph, fetchDependencies } from '../resolve';
import SourceManager, { Registration } from '../sources';
import {
  BuildGraph,
  targetExists,
  createTarget,
  buildTarget
} from '../targets';
import { writeLockfile } from '../lockfile';
import { parallel } from '../utils';

export interface BuildOptions {}
const defaultOptions = {};

export default async function build(config: Config, options: BuildOptions) {
  options = { ...defaultOptions, ...options };

  // 1. Load project
  const project = await loadProject(config);

  // 2. Fetch and prepare dependencies
  await fetchDependencies(config, project.packages);

  // 3. Create build graph
  const buildGraph = await createBuildGraph(project, options);

  // 4. Create targets
  await parallel(project.manifest.targets, async (target: Target) => {
    if (!await targetExists(config, target)) {
      await createTarget(config, target);
    }
  });

  // 5. Build targets (sequentially to avoid contention issues)
  for (const target of project.manifest.targets) {
    await buildTarget(config, target, buildGraph);
  }

  // 6. Write lockfile
  await writeLockfile(config, project);
}

export async function createBuildGraph(
  project: Project,
  options: BuildOptions
): Promise<BuildGraph> {
  const src: Map<string, Source> = new Map();
  const references: Map<string, Reference> = new Map();

  const srcError = (source: Source) =>
    `Conflicting source named "${source.name}"`;
  const referenceError = (reference: Reference) =>
    `Conflicting reference named "${reference.name}"`;

  for (const source of project.manifest.src) {
    const { name } = source;
    if (src.has(name)) throw new Error(srcError(source));
    src.set(name, source);
  }
  for (const reference of project.manifest.references) {
    const { name } = reference;
    if (references.has(name) && references.get(name).guid !== reference.guid) {
      throw new Error(referenceError(reference));
    }
    references.set(name, reference);
  }

  for (const dependency of project.packages) {
    // TODO Need manifest for each dependency (along with path information)
    // (also, manifest src needs global path)
  }

  return {
    src: Array.from(src.values()),
    references: Array.from(references.values())
  };
}
