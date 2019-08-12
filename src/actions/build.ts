import dedent from 'dedent/macro';
import { loadProject, fetchDependencies } from '../project';
import { buildTarget } from '../targets';
import { writeLockfile } from '../lockfile';
import env from '../env';
import { isRegistryDependency } from '../manifest/dependency';
import { toDependency } from '../sources/registration';
import { getTarget } from '../targets';
import { join } from '../utils/path';
import { Message } from '../messages';

import { BuildOptions } from '../targets/types';

export default async function build(options: BuildOptions = {}): Promise<string> {
  env.reporter.log(Message.BuildProjectLoading, `[1/3] Loading project...`);

  const project = await loadProject();
  const target = getTarget(project, options.target);

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
