import { normalize } from 'path';

const WINDOWS_REGEX = /\\/g;
const LEADING_SLASH = './';

export default function unixPath(value: string): string {
  let normalized = normalize(value).replace(WINDOWS_REGEX, '/');
  if (value.startsWith(LEADING_SLASH)) normalized = LEADING_SLASH + normalized;

  return normalized;
}
