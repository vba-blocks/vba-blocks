import { manifestOk } from '../errors';
import has from '../utils/has';
import { isString } from '../utils/is';
import { join, sanitize } from '../utils/path';

export type TargetType = 'xlsx' | 'xlsm' | 'xlam';

export interface Target {
  name: string;
  type: TargetType;
  path: string;
  filename: string;
  blank?: boolean;
}

const EXAMPLE = `Example vba-block.toml:

  [target]
  type = "xlsm"

  [target]
  type = "xlam"
  name = "addin"
  path = "targets/xlam"

  [targets]
  xlsm = "targets/xlsm"

  [targets.xlam]
  name = "addin"
  path = "targets/xlam"`;

export function parseTargets(
  values: any,
  pkgName: string,
  dir: string
): Target[] {
  return Object.entries(values).map(([type, value]) => {
    return parseTarget(<TargetType>type, value, pkgName, dir);
  });
}

export function parseTarget(
  type: TargetType,
  value: any,
  pkgName: string,
  dir: string
): Target {
  if (isString(value)) value = { path: value };
  if (!has(value, 'name')) value = { name: pkgName, ...value };
  const { name, path: relativePath } = value;

  manifestOk(
    relativePath,
    `target of type "${type}" is missing path. ${EXAMPLE}`
  );

  const path = join(dir, relativePath);
  const filename = `${sanitize(name)}.${type}`;

  return { name, type, path, filename };
}
