import { loadProject } from '../project';
import { BuildOptions, createBuildGraph, buildTarget } from '../targets';
import { writeLockfile } from '../lockfile';

export default async function build(options: BuildOptions = {}) {
  // Load and fetch project
  const project = await loadProject({ manifests: true });

  // Create and build targets (sequentially to avoid contention issues)
  for (const target of project.manifest.targets) {
    await buildTarget(project, target, options);
  }

  // On success, write lockfile (if necessary)
  if (project.dirty_lockfile) {
    await writeLockfile(project.workspace.root.dir, project);
  }
}
