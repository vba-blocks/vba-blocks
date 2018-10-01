import { Application } from '../addin';
import exec from './exec';
import { CliError } from '../errors';

export async function enableVBOM(application: Application) {
  try {
    await exec(['enable-vbom', application]);
  } catch (underlying) {
    throw new CliError(
      'Failed to enable access to the VBA project object model.',
      { underlying }
    );
  }
}
