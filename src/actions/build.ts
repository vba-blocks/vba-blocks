import { loadProject, fetchDependencies } from '../project';
import { BuildOptions, createBuildGraph, buildTarget } from '../targets';
import { writeLockfile } from '../lockfile';

export default async function build(options: BuildOptions = {}) {
  // Load and fetch project
  const project = await loadProject();
  const dependencies = await fetchDependencies(project);

  // Create and build targets (sequentially to avoid contention issues)
  for (const target of project.manifest.targets) {
    await buildTarget(target, { project, dependencies }, options);
  }

  // On success, write lockfile (if necessary)
  if (project.has_dirty_lockfile) {
    await writeLockfile(project.workspace.root.dir, project);
  }
}
