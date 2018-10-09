import { Target, TargetType } from '../manifest/target';
import { basename, extname, join, sanitize, resolve } from '../utils/path';
import { copy, ensureDir, emptyDir, remove } from '../utils/fs';
import { exportTo, createDocument } from '../addin';
import exportTarget, { extractTarget } from './export-target';
import buildTarget, { ProjectInfo } from './build-target';
import {
  applyChanges,
  addTarget as addTargetToManifest
} from '../manifest/patch-manifest';
import { targetAlreadyDefined } from '../errors';

export interface AddOptions {
  from?: string;
  name?: string;
  path?: string;
  __temp__log_patch?: boolean;
}

export default async function addTarget(
  type: TargetType,
  info: ProjectInfo,
  options: AddOptions = {}
) {
  const { project } = info;
  let {
    from,
    name = project.manifest.name,
    path = 'target',
    __temp__log_patch = true
  } = options;

  if (project.manifest.target) {
    throw targetAlreadyDefined();
  }

  const staging = join(project.paths.staging, 'export');
  await ensureDir(staging);
  await emptyDir(staging);

  let target: Target;
  if (from) {
    // For from, use
    // - use name of file for name of target
    // - copy file to build/
    // - run standard export on file
    from = resolve(from);
    name = basename(from, extname(from));

    target = project.manifest.target = {
      name,
      type,
      path: join(project.paths.dir, path),
      filename: `${sanitize(name)}.${type}`
    };

    await copy(from, join(project.paths.build, target.filename));
    await exportTo(project, target, staging);
    await exportTarget(target, info, staging, { __temp__log_patch });
  } else {
    // For standard add-target, don't want to remove any existing src
    // - create blank document
    // - extract target only
    // - rebuild target
    target = project.manifest.target = {
      name,
      type,
      path: join(project.paths.dir, path),
      filename: `${sanitize(name)}.${type}`
    };

    await createDocument(project, target);

    const extracted = await extractTarget(project, target, staging);
    await remove(target.path);
    await copy(extracted, target.path);

    await buildTarget(target, info);
  }

  if (__temp__log_patch) {
    applyChanges([addTargetToManifest(project.manifest, target)]);
  }

  // TODO Write directly to manifest once patching is ready
  // await writeManifest(project.manifest, project.paths.dir);

  // Finally, cleanup staging
  await remove(staging);
}
