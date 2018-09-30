import { normalize } from 'path';
import env from '../env';
import exec from './exec';
import { CliError } from '../errors';

export async function addToPATH() {
  try {
    await exec(['add-to-path', normalize(env.bin)]);
  } catch (underlying) {
    throw new CliError('Failed to add vba-blocks to PATH.', { underlying });
  }
}

export async function removeFromPATH() {
  try {
    await exec(['remove-from-path', normalize(env.bin)]);
  } catch (underlying) {
    throw new CliError('Failed to remove vba-blocks from PATH.', {
      underlying
    });
  }
}
