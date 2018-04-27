import { join } from 'path';
import unixPath from './unix-path';

export default function unixJoin(...parts: string[]): string {
  return unixPath(join(...parts));
}
