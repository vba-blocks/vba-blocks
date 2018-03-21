import { Project, loadProject } from '../project';
import { createBuildGraph, createTarget, buildTarget } from '../targets';
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
