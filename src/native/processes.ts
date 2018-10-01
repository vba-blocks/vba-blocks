import exec from './exec';
import { CliError } from '../errors';
import { BY_LINE } from '../utils/text';

export async function getProcesses(): Promise<string[]> {
  try {
    const { stdout } = await exec(['get-processes']);
    const processes = stdout.split(BY_LINE).filter(Boolean);

    return processes;
  } catch (underlying) {
    throw new CliError(`Failed to get process list.`, { underlying });
  }
}
