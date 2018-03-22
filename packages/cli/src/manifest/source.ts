import { ok } from 'assert';
import { isString, unixJoin } from '../utils';

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

export function parseSrc(value: any, dir: string): Source[] {
  return Object.entries(value).map(([name, value]) =>
    parseSource(name, value, dir)
  );
}

export function parseSource(
  name: string,
  value: string | any,
  dir: string
): Source {
  if (isString(value)) value = { path: value };
  const { path: relativePath, optional = false } = value;

  ok(relativePath, `src "${name}" is missing path. ${EXAMPLE}`);
  const path = unixJoin(dir, relativePath);

  return { name, path, optional };
}
