import { validRange } from 'semver';

export type Version = string;

export function isValid(value: string): boolean {
  return !!value && validRange(value) != null;
}
