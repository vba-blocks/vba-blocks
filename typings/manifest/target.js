import has from '../utils/has';
import { isString } from '../utils/is';
import { join, sanitize } from '../utils/path';
export function parseTarget(value, pkgName, dir) {
    if (isString(value))
        value = { type: value };
    if (!has(value, 'name'))
        value = { name: pkgName, ...value };
    const { type, name, path: relativePath = 'target' } = value;
    const path = join(dir, relativePath);
    const filename = `${sanitize(name)}.${type}`;
    return { name, type, path, filename };
}
