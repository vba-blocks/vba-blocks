import { extensionToApplication } from '../addin';
import { CliError, ErrorCode } from '../errors';
import { loadProject } from '../project';
import { getTarget } from '../targets';
import { extname, join, resolve } from '../utils/path';
import runMacro, { RunResult } from '../utils/run';

export interface RunOptions {
  target?: string;
  file?: string;
  macro: string;
  args: string[];
}

export default async function run(options: RunOptions): Promise<RunResult> {
  let { target: target_type, file, macro, args = [''] } = options;

  if (!file) {
    const project = await loadProject();
    const { target } = getTarget(project, target_type);

    file = join(project.paths.dir, 'build', target.filename);
  }

  if (!file) {
    throw new CliError(
      ErrorCode.RunMissingFile,
      `file is required for vba-blocks run (e.g. vba-blocks run --file FILE <macro> <arg>...).`
    );
  }
  if (!macro) {
    throw new CliError(
      ErrorCode.RunMissingMacro,
      `macro is required for vba-blocks run (e.g. vba-blocks run --file FILE <macro> <arg>...).`
    );
  }

  const application = extensionToApplication(extname(file));
  const result = await runMacro(application, resolve(file), macro, args);
  const { stdout } = result;

  if (stdout && stdout.trim().length) console.log(stdout);

  return result;
}
