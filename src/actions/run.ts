import _run from '../utils/run';
import { extname } from '../utils/path';
import { runMissingFile, runMissingMacro } from '../errors';
import { extensionToApplication } from '../addin';

export interface RunOptions {
  file: string;
  macro: string;
  arg?: string;
}

export default async function run(options: RunOptions) {
  const { file, macro, arg = '' } = options;

  if (!file) throw runMissingFile();
  if (!macro) throw runMissingMacro();

  const application = extensionToApplication(extname(file));
  const { stdout } = await _run(application, file, macro, arg);
  console.log(stdout);
}
