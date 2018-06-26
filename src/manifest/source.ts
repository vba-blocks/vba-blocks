import { manifestOk } from '../errors';
import { isString } from '../utils/is';
import { join } from '../utils/path';

export interface Source {
  name: string;
  path: string;
  binary?: string;
  optional?: boolean;
  original?: string;
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
  const { path: relativePath, binary, optional = false } = value;

  manifestOk(relativePath, `src "${name}" is missing path. ${EXAMPLE}`);
  const path = join(dir, relativePath);

  const source: Source = { name, path, optional };
  if (binary) source.binary = join(dir, binary);

  return source;
}
