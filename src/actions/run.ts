import runMacro from '../utils/run';
import { extname, join, resolve } from '../utils/path';
import { CliError, ErrorCode } from '../errors';
import { extensionToApplication } from '../addin';
import { loadProject } from '../project';
import { getTarget } from '../targets';

export interface RunOptions {
  target?: string;
  file?: string;
  macro: string;
  args: string[];
}

export default async function run(options: RunOptions) {
  let { target: target_type, file, macro, args = [''] } = options;

  if (!file) {
    const project = await loadProject();
    const target = getTarget(project, target_type);

    file = join(project.manifest.dir, 'build', target.filename);
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
  const { stdout } = await runMacro(application, resolve(file), macro, args);

  if (stdout && stdout.trim().length) console.log(stdout);
}
