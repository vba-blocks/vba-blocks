import { validRange } from 'semver';

export function isValid(value: string): boolean {
  return !!value && validRange(value) != null;
}
