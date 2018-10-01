import { Application, addins } from '../addin';
import exec from './exec';
import { CliError } from '../errors';

export async function addToOPEN(application: Application, filename: string) {
  try {
    await exec(['add-to-open', application, filename]);
  } catch (underlying) {
    throw new CliError(
      `Failed to add ${filename} to add-ins for ${application}.`,
      { underlying }
    );
  }
}

export async function removeFromOPEN(
  application: Application,
  filename: string
) {
  try {
    await exec(['remove-from-open', application, filename]);
  } catch (underlying) {
    throw new CliError(
      `Failed to remove ${filename} from add-ins for ${application}.`,
      { underlying }
    );
  }
}
