import { validRange } from 'semver';

export type Version = string;

export const DEFAULT_VERSION = 'DEFAULT';

export function isValid(value: string): value is Version {
  return !!value && validRange(value) != null;
}
