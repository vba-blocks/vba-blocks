import dedent from 'dedent/macro';
import { loadProject, fetchDependencies } from '../project';
import { buildTarget } from '../targets';
import { writeLockfile } from '../lockfile';
import { CliError, ErrorCode } from '../errors';
import env from '../env';
import { isRegistryDependency } from '../manifest/dependency';
import { toDependency } from '../sources/registration';
import { sanitize, join } from '../utils/path';
import { Message } from '../messages';

import { BuildOptions } from '../targets/types';
import { Target, TargetType } from '../manifest/types';

export default async function build(options: BuildOptions = {}): Promise<string> {
  env.reporter.log(Message.BuildProjectLoading, `[1/3] Loading project...`);

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
        or specify 'project.target' in vba-block.toml.
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
  env.reporter.log(
    Message.BuildTargetBuilding,
    dedent`
      \n[2/3] Building target "${target.type}" for "${project.manifest.name}"...
      ${display_dependencies.length ? `\nDependencies:\n${display_dependencies.join('\n')}` : ''}`
  );

  await buildTarget(target, { project, dependencies }, options);

  // Update lockfile (if necessary)
  const skip = !project.has_dirty_lockfile;
  env.reporter.log(
    Message.BuildLockfileWriting,
    `\n[3/3] Writing lockfile...${skip ? ' (skipped, no changes)' : ''}`
  );
  if (!skip) {
    await writeLockfile(project.workspace.root.dir, project);
  }

  return join(project.manifest.dir, 'build', target.filename);
}
