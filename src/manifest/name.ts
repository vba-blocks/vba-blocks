import dedent from '@timhall/dedent/macro';
import { CliError, ErrorCode } from '../errors';

/*
  # Project/package name

  Name requirements:
  - Must not be empty
  - Allowed characters: A-Z a-z 0-9 - _ . /
  - Must start with an alphanumeric
  - A single / is allowed for scoped packages
  - A maximum length of 255 for the scope and 255 for the package name

  Note:
  - Capitals are allowed, but compared and stored as lowercase
*/

const ONLY_VALID_CHARACTERS = /^[A-Za-z0-9-_./]*$/;
const STARTS_WITH_ALPHANUMERIC = /^[A-Za-z0-9]/;
const MAX_LENGTH = 255;

export interface ManifestName {
  scope: string | undefined;
  name: string;
  parts: string[];
}

export function parseName(name: string): ManifestName {
  assertValidName(name);

  // Manifest name is case-insensitve,
  // but parsed name isn't for comparison, uniqueness, and file naming
  name = name.toLowerCase();

  let scope: string | undefined;
  let pkg: string;
  if (name.includes('/')) {
    [scope, pkg] = name.split('/');
  } else {
    pkg = name;
  }

  return { scope, name: pkg, parts: scope ? [scope, pkg] : [pkg] };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateName(name: string): ValidationResult {
  const errors = [];

  if (!name || typeof name !== 'string' || !name.length) {
    errors.push('name must not be empty');
  }
  if (!ONLY_VALID_CHARACTERS.test(name)) {
    errors.push('name must only include the following characters: A-Z a-z 0-9 - _ . /');
  }
  if (!STARTS_WITH_ALPHANUMERIC.test(name)) {
    errors.push('name must only start with the following characters: A-Z a-z 0-9');
  }
  if (countMatches(name, /\//g) > 1) {
    errors.push('name must only include a single / for scoped packages');
  }

  let scope: string | undefined;
  let pkg: string;
  if (name.includes('/')) {
    [scope, pkg] = name.split('/');
  } else {
    pkg = name;
  }

  if (scope && scope.length > MAX_LENGTH) {
    errors.push(`scope must be less than ${MAX_LENGTH} characters`);
  }
  if (pkg.length > MAX_LENGTH) {
    errors.push(`name must be less than ${MAX_LENGTH} characters`);
  }

  return { valid: errors.length === 0, errors };
}

export function assertValidName(name: string) {
  const { valid, errors } = validateName(name);
  if (valid) return;

  const error_messages = errors.map(error => `- ${error}`).join('\n');

  throw new CliError(
    ErrorCode.ManifestNameInvalid,
    dedent`
      Invalid project/package name "${name}"

      Errors:
      ${error_messages}
    `
  );
}

function countMatches(value: string, search: RegExp): number {
  return (value.match(search) || []).length;
}
