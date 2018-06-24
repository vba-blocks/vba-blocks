import { loadProject, fetchDependencies } from '../project';
import { BuildOptions, buildTarget } from '../targets';
import { writeLockfile } from '../lockfile';

/**
 * Build
 *
 * 1. Load Project
 *    a. Load Manifest
 *    b. Load Workspace
 *    c. Load Lockfile
 *    d. Resolve Dependencies
 * 2. Fetch Dependenices
 * 3. Build targets
 *    a. Create binary
 *    b. Create ProjectGraph
 *    c. Transform ProjectGraph
 *    d. Stage ProjectGraph
 *    e. Import ProjectGraph
 * 4. Write Lockfile
 */
export default async function build(options: BuildOptions = {}) {
  // 1
  const project = await loadProject();

  // 2
  const dependencies = await fetchDependencies(project);

  // 3 (sequentially to avoid contention issues)
  for (const target of project.manifest.targets) {
    await buildTarget(target, { project, dependencies }, options);
  }

  // 4 (if necessary)
  if (project.has_dirty_lockfile) {
    await writeLockfile(project.workspace.root.dir, project);
  }
}
