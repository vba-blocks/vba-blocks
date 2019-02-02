import dedent from 'dedent/macro';
import { loadProject, fetchDependencies } from '../project';
import { buildTarget } from '../targets';
import { writeLockfile } from '../lockfile';
import { CliError, ErrorCode } from '../errors';
import env from '../env';
import { buildLoadingProject, buildBuildingTarget, buildWritingLockfile } from '../messages';
import { isRegistryDependency } from '../manifest/dependency';
import { toDependency } from '../sources/registration';
import { sanitize, join } from '../utils/path';

import { BuildOptions } from '../targets/types';
import { Target, TargetType } from '../manifest/types';

export default async function build(options: BuildOptions = {}): Promise<string> {
  env.reporter.log(buildLoadingProject());

  const project = await loadProject();

  // Load target from --target TYPE option or project manifest
  let target: Target | undefined;
  if (options.target) {
    if (project.manifest.target) {
      // For defined target, --target TYPE must match target.type
      if (project.manifest.target.type === options.target) {
        target = project.manifest.target;
      }
    } else {
      // Create blank target for --target TYPE
      const type = <TargetType>options.target;
      const name = project.manifest.name;

      target = {
        type,
        name,
        path: 'target',
        filename: `${sanitize(name)}.${type}`,
        blank: true
      };
    }

    if (!target) {
      throw new CliError(
        ErrorCode.TargetNoMatching,
        `No matching target found for type "${options.target}" in project.`
      );
    }
  } else if (project.manifest.target) {
    // Build [target]
    target = project.manifest.target;
  }

  if (!target) {
    throw new CliError(
      ErrorCode.TargetNoDefault,
      dedent`
        No default target(s) found for project.

        Use --target TYPE for a blank target
        or specify [target] or [targets] in vba-block.toml.
      `
    );
  }

  // Fetch relevant dependencies
  const dependencies = await fetchDependencies(project);

  // Build target
  const display_dependencies = project.packages.map(registration => {
    const dependency = toDependency(registration);

    if (isRegistryDependency(dependency))
      return `${registration.id} registry+${dependency.registry}`;
    else return `${registration.id} ${registration.source}`;
  });
  env.reporter.log(buildBuildingTarget(target, project, display_dependencies));

  await buildTarget(target, { project, dependencies }, options);

  // Update lockfile (if necessary)
  env.reporter.log(buildWritingLockfile(!project.has_dirty_lockfile));
  if (project.has_dirty_lockfile) {
    await writeLockfile(project.workspace.root.dir, project);
  }

  return join(project.manifest.dir, 'build', target.filename);
}
