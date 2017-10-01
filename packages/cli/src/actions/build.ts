import { Config } from '../config';
import { loadProject } from '../project';
import {
  createBuildGraph,
  createTarget,
  buildTarget,
  BuildGraphOptions
} from '../targets';
import { writeLockfile } from '../lockfile';

export interface BuildOptions {}
const defaultOptions = {};

export default async function build(config: Config, options: BuildOptions) {
  options = { ...defaultOptions, ...options };

  // 1. Load project
  const project = await loadProject(config);

  // 2. Create build graph
  const buildGraph = await createBuildGraph(config, project, options);

  // 3. Create and build targets (sequentially to avoid contention issues)
  for (const target of project.manifest.targets) {
    await createTarget(config, target);
    await buildTarget(config, target, buildGraph);
  }

  // 4. On success, write lockfile
  await writeLockfile(config, project);
}
