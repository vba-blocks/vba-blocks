import * as assert from 'assert';
import { isString } from '../utils';

export interface Source {
  name: string;
  path: string;
  optional?: boolean;
}

const EXAMPLE = `Example vba-block.toml:

  [src]
  A = "src/a.bas"
  B = { path = "src/b.cls" }
  C = { path = "src/c.frm, optional = true }`;

export function parseSrc(value: any): Source[] {
  return Object.entries(value).map(([name, value]) => parseSource(name, value));
}

export function parseSource(name: string, value: string | any): Source {
  if (isString(value)) value = { path: value };
  const { path, optional = false } = value;

  assert.ok(path, `src "${name}" is missing path. ${EXAMPLE}`);

  return { name, path, optional };
}
