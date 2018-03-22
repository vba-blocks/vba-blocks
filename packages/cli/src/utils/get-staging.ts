import { join, normalize } from 'path';
import { homedir } from 'os';
import { ensureDir } from './fs';

export default async function getStaging(): Promise<string> {
  // TODO This is potentially brittle, use search in the future
  const dir = join(homedir(), 'Library/Group Containers/UBF8T346G9.Office');

  const staging = join(dir, '.vba-blocks');
  await ensureDir(staging);

  return staging;
}
