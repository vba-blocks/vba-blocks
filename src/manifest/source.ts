import { manifestOk } from '../errors';
import { isString } from '../utils/is';
import { join } from '../utils/path';

/*
  # Source

  A source file to be imported

  source: path | { path }
*/

export interface Source {
  name: string;
  path: string;
  binary?: string;
}

const EXAMPLE = `Example vba-block.toml:

  [src]
  A = "src/a.bas"
  B = { path = "src/b.cls" }`;

export function parseSrc(value: any, dir: string): Source[] {
  return Object.entries(value).map(([name, value]) => parseSource(name, value, dir));
}

export function parseSource(name: string, value: string | any, dir: string): Source {
  if (isString(value)) value = { path: value };
  const { path: relativePath, binary } = value;

  manifestOk(relativePath, `src "${name}" is missing path. \n\n${EXAMPLE}`);
  const path = join(dir, relativePath);

  const source: Source = { name, path };
  if (binary) source.binary = join(dir, binary);

  return source;
}
