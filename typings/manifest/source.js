import { manifestOk } from '../errors';
import { isString } from '../utils/is';
import { join } from '../utils/path';
const EXAMPLE = `Example vba-block.toml:

  [src]
  A = "src/a.bas"
  B = { path = "src/b.cls" }
  C = { path = "src/c.frm, optional = true }`;
export function parseSrc(value, dir) {
    return Object.entries(value).map(([name, value]) => parseSource(name, value, dir));
}
export function parseSource(name, value, dir) {
    if (isString(value))
        value = { path: value };
    const { path: relativePath, binary, optional = false } = value;
    manifestOk(relativePath, `src "${name}" is missing path. ${EXAMPLE}`);
    const path = join(dir, relativePath);
    const source = { name, path, optional };
    if (binary)
        source.binary = join(dir, binary);
    return source;
}
