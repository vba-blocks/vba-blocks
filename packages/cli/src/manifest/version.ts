import { valid } from 'semver';

export type Version = string;

export function isValid(value: string): boolean {
  return !!value && valid(value) != null;
}
