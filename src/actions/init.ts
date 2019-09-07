import dedent from 'dedent/macro';
import env from '../env';
import { CliError, ErrorCode } from '../errors';
import { Manifest, writeManifest } from '../manifest';
import { TargetType } from '../manifest/target';
import { initProject } from '../project';
import addTarget from '../targets/add-target';
import { ensureDir, pathExists, writeFile } from '../utils/fs';
import { init as git_init } from '../utils/git';
import { basename, extname, join } from '../utils/path';

export interface InitOptions {
  name?: string;
  dir?: string;
  target?: string;
  from?: string;
  pkg: boolean;
  git: boolean;
}

export default async function init(options: InitOptions) {
  let { name, dir = env.cwd, target: target_type, from, pkg: as_package, git } = options;

  if (await pathExists(join(dir, 'vba-block.toml'))) {
    throw new CliError(
      ErrorCode.InitAlreadyInitialized,
      `A vba-blocks project already exists in this directory.`
    );
  }

  if (from && !(await pathExists(from))) {
    throw new CliError(ErrorCode.FromNotFound, `The "from" document was not found at "${from}".`);
  }

  name = name || (from ? basename(from, extname(from)) : basename(dir));

  if (!name) {
    throw new CliError(
      ErrorCode.InitNameRequired,
      dedent`
        Unable to determine name from current directory or --from.
        --name NAME is required to initialize this project.
      `
    );
  }
  if (!target_type && !from && name.includes('.')) {
    const parts = name.split('.');
    target_type = parts.pop();
    name = parts.join('.');
  }

  if (!as_package && !target_type && !from) {
    throw new CliError(
      ErrorCode.InitTargetRequired,
      dedent`
        --target or --from is required for vba-blocks projects.
        (e.g. vba-blocks init --target xlsm)
      `
    );
  }

  await ensureDir(join(dir, 'src'));

  if (git && !(await pathExists(join(dir, '.git')))) {
    await git_init(dir);
    await writeFile(join(dir, '.gitignore'), `/build`);
    await writeFile(
      join(dir, '.gitattributes'),
      `* text=auto\n*.bas text eol=crlf\n*.cls text eol=crlf`
    );
    await writeFile(
      join(dir, '.editorconfig'),
      dedent`
        [*]
        trim_trailing_whitespace = true
        insert_final_newline = true
        charset = utf-8

        [*.{bas,cls}]
        end_of_line = crlf
      `
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
    await addTarget(<TargetType>target_type, { project, dependencies }, { from });
  }

  await writeManifest(project.manifest, project.paths.dir);
}
