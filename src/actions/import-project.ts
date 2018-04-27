import { loadProject } from '../project';
import { BuildOptions, importTarget } from '../targets';
import { writeLockfile } from '../lockfile';

export default async function importProject(options: BuildOptions) {
  const project = await loadProject({ manifests: true });

  for (const target of project.manifest.targets) {
    // TODO Check for built target before attempting import
    await importTarget(project, target, options);
  }

  // On success, write lockfile (if necessary)
  if (project.dirty_lockfile) {
    await writeLockfile(project.workspace.root.dir, project);
  }
}
