import { homedir } from 'os';
import { ensureDirSync } from './fs';
import unixJoin from './unix-join';

export default function getStaging(cache: string): string {
  const staging =
    process.platform === 'win32'
      ? unixJoin(cache, 'staging')
      : unixJoin(findMacOfficeContainer(), '.vba-blocks');
  ensureDirSync(staging);

  return staging;
}

function findMacOfficeContainer(): string {
  // TODO This is potentially brittle, use search in the future
  // e.g. readdirSync(Group Containers) -> look for *.Office
  return unixJoin(homedir(), 'Library/Group Containers/UBF8T346G9.Office');
}
