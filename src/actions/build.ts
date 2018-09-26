import { Target } from '../manifest';
import { TargetType } from '../manifest/target';
import { loadProject, fetchDependencies } from '../project';
import { BuildOptions, buildTarget } from '../targets';
import { writeLockfile } from '../lockfile';
import { targetNoMatching, targetNoDefault } from '../errors';
import env from '../env';
import {
  buildLoadingProject,
  buildBuildingTargets,
  buildBuildingTarget,
  buildWritingLockfile
} from '../messages';
import { isRegistryDependency } from '../manifest/dependency';
import { toDependency } from '../sources/registration';
import { sanitize } from '../utils/path';

export default async function build(options: BuildOptions = {}) {
  env.reporter.log(buildLoadingProject());

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
        filename: `${sanitize(name)}.${type}`,
        blank: true
      };
    }

    if (!target) {
      throw targetNoMatching(options.target);
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
    throw targetNoDefault();
  }

  // Fetch relevant dependencies
  const dependencies = await fetchDependencies(project);

  // Build target(s) (sequentially to avoid contention issues)
  env.reporter.log(buildBuildingTargets(targets.length));
  const display_dependencies = project.packages.map(registration => {
    const dependency = toDependency(registration);

    if (isRegistryDependency(dependency))
      return `${registration.id} registry+${dependency.registry}`;
    else return `${registration.id} ${registration.source}`;
  });

  for (const target of targets) {
    env.reporter.log(
      buildBuildingTarget(target, project, display_dependencies)
    );

    await buildTarget(target, { project, dependencies }, options);
  }

  // Update lockfile (if necessary)
  env.reporter.log(buildWritingLockfile(!project.has_dirty_lockfile));
  if (project.has_dirty_lockfile) {
    await writeLockfile(project.workspace.root.dir, project);
  }
}
