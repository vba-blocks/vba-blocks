import env from '../env';
import { Manifest, writeManifest } from '../manifest';
import { TargetType } from '../manifest/target';
import { initProject } from '../project';
import addTarget from '../targets/add-target';
import { join, extname } from '../utils/path';
import { pathExists, ensureDir, writeFile } from '../utils/fs';
import { init } from '../utils/git';
import { newNameRequired, newDirExists, fromNotFound } from '../errors';

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

  let {
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
    await writeFile(join(dir, '.gitignore'), `/build`);
    await writeFile(
      join(dir, '.gitattributes'),
      `* text=auto\n*.bas text eol=crlf\n*.cls text eol=crlf`
    );
  }

  const project = await initProject(name, dir, {
    type: as_package ? 'package' : 'project'
  });

  if (from) {
    target_type = extname(from).replace('.', '');
  }
  if (target_type) {
    const dependencies: Manifest[] = [];
    await addTarget(
      <TargetType>target_type,
      { project, dependencies },
      { from }
    );
  }

  await writeManifest(project.manifest, project.paths.dir);
}
