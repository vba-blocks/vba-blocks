import env from '../env';
import { Target, writeManifest } from '../manifest';
import { TargetType } from '../manifest/target';
import { initProject } from '../project';
import { join, basename, extname, sanitize } from '../utils/path';
import { pathExists, ensureDir, writeFile, copy, emptyDir } from '../utils/fs';
import { init } from '../utils/git';
import { newNameRequired, newDirExists, fromNotFound } from '../errors';
import { createDocument, exportTo } from '../addin';
import exportTarget from '../targets/export-target';

export interface CreateOptions {
  name: string;
  target?: string;
  from?: string;
  pkg: boolean;
  git: boolean;
}

export default async function create(options: CreateOptions) {
  if (!options || !options.name) {
    throw newNameRequired();
  }

  const {
    name,
    target: target_type,
    from,
    pkg: as_package,
    git: git_init
  } = options;
  const dir = join(env.cwd, name);

  if (await pathExists(dir)) {
    throw newDirExists(name, dir);
  }
  if (from && !(await pathExists(from))) {
    throw fromNotFound(from);
  }

  await ensureDir(join(dir, 'src'));
  await ensureDir(join(dir, 'targets'));

  if (git_init) {
    await init(dir);
    await writeFile(join(dir, '.gitignore'), `build/`);
    await writeFile(
      join(dir, '.gitattributes'),
      `* text=auto\n*.bas text eol=crlf\n*.cls text eol=crlf`
    );
  }

  const project = await initProject(name, dir);

  let target: Target;
  if (from) {
    const target_type = extname(from).replace('.', '');
    const target_name = basename(from, extname(from));

    target = {
      name: target_name,
      type: <TargetType>target_type,
      path: join(dir, `targets/${target_type}`),
      filename: `${sanitize(target_name)}.${target_type}`
    };

    await copy(from, join(project.paths.build, target.filename));
  } else if (target_type) {
    target = {
      name,
      type: <TargetType>target_type,
      path: join(dir, `targets/${target_type}`),
      filename: `${sanitize(name)}.${target_type}`
    };

    await createDocument(project, target);
  }

  if (target!) {
    project.manifest.targets.push(target!);

    const staging = join(project.paths.staging, 'export');

    await ensureDir(staging);
    await emptyDir(staging);
    await exportTo(project, target!, staging);

    const previous = env.silent;
    env.silent = true;

    await exportTarget(target!, { project, dependencies: [] }, staging);

    env.silent = previous;
  }

  await writeManifest(project.manifest, project.paths.dir);
}
