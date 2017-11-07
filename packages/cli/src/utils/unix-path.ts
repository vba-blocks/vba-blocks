import { join, sep } from 'path';

export default function unixPath(value: string): string {
  return value.split(sep).join('/');
}
