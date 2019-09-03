import { manifestOk } from '../errors';
import has from '../utils/has';
import { isString } from '../utils/is';
import { join, relative, sanitize } from '../utils/path';

/*
  # Target

  target: type | { type, name?, path? }

  By default "target" is used for path
*/

export type TargetType = 'xlsx' | 'xlsm' | 'xlam';

export interface Target {
  name: string;
  type: TargetType;
  path: string;
  filename: string;
}

const target_types = ['xlsx', 'xlsm', 'xlam'];

const EXAMPLE = `Example vba-block.toml:

  [project]
  target = "xlsm"

Example vba-block.toml with alternative path:

  [project]
  target = { type = "xlsm", path = "target/xlsm" }`;

export function parseTarget(value: any, pkgName: string, dir: string): Target {
  if (isString(value)) value = { type: value };
  if (!has(value, 'name')) value = { name: pkgName, ...value };
  const { type, name, path: relativePath = 'target' } = value;

  manifestOk(isString(type), `Target is missing "type". \n\n${EXAMPLE}.`);
  manifestOk(
    isSupportedTargetType(type),
    `Unsupported target type "${type}". Only "xlsx", "xlsm", and "xlam" are supported currently.`
  );

  const path = join(dir, relativePath);
  const filename = `${sanitize(name)}.${type}`;

  return { name, type, path, filename };
}

export function isSupportedTargetType(type: string): type is TargetType {
  return isString(type) && target_types.includes(type);
}

export function formatTarget(target: Target, default_name: string, dir: string): string | object {
  let { name, type: target_type, path } = target;
  path = relative(dir, path);

  let value: string | { type: string; name?: string; path?: string };
  if (name !== default_name || path !== 'target') {
    value = { type: target_type };
    if (name !== default_name) value.name = name;
    if (path !== 'target') value.path = path;
  } else {
    value = target_type;
  }

  return value;
}
