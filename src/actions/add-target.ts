import env from '../env';
import { Target, writeManifest } from '../manifest';
import { TargetType } from '../manifest/target';
import { loadProject, fetchDependencies } from '../project';
import { join, extname, basename, sanitize } from '../utils/path';
import { copy, ensureDir, emptyDir } from '../utils/fs';
import { createDocument, exportTo } from '../addin';
import exportTarget from '../targets/export-target';

export interface AddOptions {
  type: TargetType;
  from?: string;
  name?: string;
  path?: string;
}

export default async function add(options: AddOptions) {
  let { type, from, name, path } = options;
  if (!type) {
    throw new Error('type is required (e.g. vba-blocks target add xlsm)');
  }

  const project = await loadProject();
  const dependencies = await fetchDependencies(project);

  let target: Target;
  if (from) {
    type = <TargetType>extname(from).replace('.', '');
    name = basename(from, extname(from));

    target = {
      name,
      type,
      path: join(project.paths.dir, path || `targets/${type}`),
      filename: `${sanitize(name)}.${type}`
    };

    await copy(from, join(project.paths.build, target.filename));
  } else {
    name = name || project.manifest.name;

    target = {
      name,
      type,
      path: join(project.paths.dir, `targets/${type}`),
      filename: `${sanitize(name)}.${type}`
    };

    await createDocument(project, target);
  }

  project.manifest.targets.push(target!);

  const staging = join(project.paths.staging, 'export');

  await ensureDir(staging);
  await emptyDir(staging);
  await exportTo(project, target!, staging);

  await exportTarget(target!, { project, dependencies }, staging);
  await writeManifest(project.manifest, project.paths.dir);
}
