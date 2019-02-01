import _run from '../utils/run';
import { extname, resolve } from '../utils/path';
import { runMissingFile, runMissingMacro } from '../errors';
import { extensionToApplication } from '../addin';
export default async function run(options) {
    const { file, macro, arg = '' } = options;
    if (!file)
        throw runMissingFile();
    if (!macro)
        throw runMissingMacro();
    const application = extensionToApplication(extname(file));
    const { stdout } = await _run(application, resolve(file), macro, arg);
    console.log(stdout);
}
