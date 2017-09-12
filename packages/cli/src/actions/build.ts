import { Config } from '../config';
import { Manifest, loadManifest } from '../manifest';
import resolve, { DependencyGraph } from '../resolve';
import SourceManager from '../sources';
import {
  BuildGraph,
  targetExists,
  createTarget,
  buildTarget
} from '../targets';
import { writeLockfile } from '../lockfile';
import { parallel } from '../utils';

export interface BuildOptions {
  release?: boolean;
  features?: string[];
  default_features?: boolean;
  all_features?: boolean;
}

export default async function build(
  config: Config,
  options: BuildOptions = {}
) {
  const {
    release = false,
    features = [],
    default_features = true,
    all_features = false
  } = options;

  // 1. Load manifest
  const manifest = await loadManifest(config.cwd);

  // 2. Resolve dependencies
  const resolved = await resolve(config, manifest);

  // 3. Fetch and prepare dependencies
  const manager = new SourceManager(config);
  await parallel(resolved, registration => manager.fetch(registration));

  // 4. Create build graph
  const buildGraph = await createBuildGraph(manifest, resolved);

  // 5. Create targets
  await parallel(manifest.targets, async target => {
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
  resolved: DependencyGraph
): Promise<BuildGraph> {
  return { src: [], references: [] };
}
