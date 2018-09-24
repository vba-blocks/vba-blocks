import { Target } from '../manifest';
import { TargetType } from '../manifest/target';
import { loadProject, fetchDependencies } from '../project';
import { BuildOptions, buildTarget } from '../targets';
import { writeLockfile } from '../lockfile';

export default async function build(options: BuildOptions = {}) {
  const project = await loadProject();

  // Load targets from --target TYPE option or project manifest
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
      // Create blank target for --target TYPE
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
      // TODO "official" error
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
    // TODO "official" error
    throw new Error(
      '--target TYPE is required or specify [target] or [targets]'
    );
  }

  // Fetch relevant dependencies
  const dependencies = await fetchDependencies(project);

  // Build target(s) (sequentially to avoid contention issues)
  for (const target of targets) {
    await buildTarget(target, { project, dependencies }, options);
  }

  // Update lockfile (if necessary)
  if (project.has_dirty_lockfile) {
    await writeLockfile(project.workspace.root.dir, project);
  }
}
