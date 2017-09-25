import { Config } from '../config';
import { Manifest, Target, Source, Reference, loadManifest } from '../manifest';
import resolve, { DependencyGraph } from '../resolve';
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
  options = Object.assign({}, defaultOptions, options);

  // 1. Load manifest
  const manifest = await loadManifest(config.cwd, { resolve: true });

  // 2. Resolve dependencies
  const resolved = await resolve(config, manifest);

  // 3. Fetch and prepare dependencies
  const manager = new SourceManager(config);
  await parallel(resolved, (registration: Registration) =>
    manager.fetch(registration)
  );

  // 4. Create build graph
  const buildGraph = await createBuildGraph(manifest, resolved, options);

  // 5. Create targets
  await parallel(manifest.targets, async (target: Target) => {
    if (!await targetExists(config, target)) {
      await createTarget(config, target);
    }
  });

  // 6. Build targets (sequentially to avoid contention issues)
  for (const target of manifest.targets) {
    await buildTarget(config, target, buildGraph);
  }

  // 7. Write lockfile
  await writeLockfile(config, { manifest, resolved });
}

export async function createBuildGraph(
  manifest: Manifest,
  resolved: DependencyGraph,
  options: BuildOptions
): Promise<BuildGraph> {
  const src: Map<string, Source> = new Map();
  const references: Map<string, Reference> = new Map();

  const srcError = (source: Source) =>
    `Conflicting source named "${source.name}"`;
  const referenceError = (reference: Reference) =>
    `Conflicting reference named "${reference.name}"`;

  for (const source of manifest.src) {
    const { name } = source;
    if (src.has(name)) throw new Error(srcError(source));
    src.set(name, source);
  }
  for (const reference of manifest.references) {
    const { name } = reference;
    if (references.has(name) && references.get(name).guid !== reference.guid) {
      throw new Error(referenceError(reference));
    }
    references.set(name, reference);
  }

  for (const dependency of resolved) {
    // TODO Need manifest for each dependency (along with path information)
    // (also, manifest src needs global path)
  }

  return {
    src: Array.from(src.values()),
    references: Array.from(references.values())
  };
}
