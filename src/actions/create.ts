import dedent from 'dedent/macro';
import env from '../env';
import { join } from '../utils/path';
import { pathExists, ensureDir } from '../utils/fs';
import init from './init';
import { CliError, ErrorCode } from '../errors';

export interface CreateOptions {
  name: string;
  target?: string;
  from?: string;
  pkg: boolean;
  git: boolean;
}

export default async function create(options: CreateOptions) {
  if (!options || !options.name) {
    throw new CliError(
      ErrorCode.NewNameRequired,
      dedent`
        "name" is required with vba-blocks new (e.g. vba-blocks new project-name).

        Try "vba-blocks help new" for more information.
      `
    );
  }

  let { name, target, from, pkg, git } = options;

  // Load target from extension (if given)
  if (!target && !from && name.includes('.')) {
    const parts = name.split('.');
    target = parts.pop();
    name = parts.join('.');
  }
  if (!pkg && !target && !from) {
    throw new CliError(
      ErrorCode.NewTargetRequired,
      dedent`
        .TYPE, --target, or --from is required for vba-blocks projects.
        (e.g. vba-blocks new project.name.TYPE)

        Try "vba-blocks help new" for more information.
      `
    );
  }

  const dir = join(env.cwd, name);

  if (await pathExists(dir)) {
    throw new CliError(
      ErrorCode.NewDirExists,
      `A directory for "${name}" already exists: "${dir}". `
    );
  }

  await ensureDir(dir);
  await init({ name, dir, target, from, pkg, git });
}
