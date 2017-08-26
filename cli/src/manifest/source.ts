import * as assert from 'assert';
import { isString } from '../utils';

export interface Source {
  name: string;
  path: string;
  optional?: boolean;
}

export function parseSource(name: string, value: string | any): Source {
  if (isString(value)) value = { path: value };
  const { path, optional = false } = value;

  assert.ok(path, `[src] "${name}" is missing path`);

  return { name, path, optional };
}
