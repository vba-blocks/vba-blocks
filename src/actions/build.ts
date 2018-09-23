import { Target } from '../manifest';
import { TargetType } from '../manifest/target';
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
 * 3. Build target(s)
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

  let targets: Target[] | undefined;
  if (options.target) {
    let target: Target | undefined;
    if (project.manifest.target) {
      // For [target], --target TYPE must match target.type
      if (project.manifest.target.type === options.target) {
        target = project.manifest.target;
      }
    } else if (project.manifest.targets) {
      // For [targets], --target TYPE must match one target
      target = project.manifest.targets.find(
        target => target.type === options.target
      );
    } else {
      const type = <TargetType>options.target;
      const name = project.manifest.name;

      target = {
        type,
        name,
        path: `targets/${type}`,
        filename: `${name}.${type}`,
        blank: true
      };
    }

    if (!target) {
      throw new Error(
        `Target "${options.target}" not found for the current project`
      );
    }

    targets = [target];
  } else if (project.manifest.target) {
    // Build [target]
    targets = [project.manifest.target];
  } else if (project.manifest.targets) {
    // Build all [targets]
    targets = project.manifest.targets;
  }

  if (!targets) {
    throw new Error(
      '--target TYPE is required or specify [target] or [targets]'
    );
  }

  // 2
  const dependencies = await fetchDependencies(project);

  // 3
  // (sequentially to avoid contention issues)
  for (const target of targets) {
    await buildTarget(target, { project, dependencies }, options);
  }

  // 4 (if necessary)
  if (project.has_dirty_lockfile) {
    await writeLockfile(project.workspace.root.dir, project);
  }
}
