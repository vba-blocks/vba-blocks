import runMacro from '../utils/run';
import { extname, resolve } from '../utils/path';
import { CliError, ErrorCode } from '../errors';
import { extensionToApplication } from '../addin';

import { RunOptions } from './types';

export default async function run(options: RunOptions) {
  const { file, macro, arg = '' } = options;

  if (!file) {
    throw new CliError(
      ErrorCode.RunMissingFile,
      `file is required for vba-blocks run (e.g. vba-blocks run FILE MACRO [ARGS...]).`
    );
  }
  if (!macro) {
    throw new CliError(
      ErrorCode.RunMissingMacro,
      `macro is required for vba-blocks run (e.g. vba-blocks run FILE MACRO [ARGS...]).`
    );
  }

  const application = extensionToApplication(extname(file));
  const { stdout } = await runMacro(application, resolve(file), macro, arg);
  console.log(stdout);
}
