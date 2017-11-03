import { ok } from 'assert';
import { join } from 'path';
import { has } from '../utils';

export type TargetType = 'xlsx' | 'xlsm' | 'xlam';

export interface Target {
  name: string;
  type: TargetType;
  path: string;
}

const EXAMPLE = `Example vba-block.toml:

  [[targets]]
  type = "xlsm"
  path = "targets/xlsm"

  [[targets]]
  name = "addin"
  type = "xlam"
  path = "targets/xlam"`;

export function parseTargets(
  values: any[],
  pkgName: string,
  dir: string
): Target[] {
  ok(Array.isArray(values), `targets must be an array. ${EXAMPLE}`);

  return values.map(value => parseTarget(value, pkgName, dir));
}

export function parseTarget(value: any, pkgName: string, dir: string): Target {
  if (!has(value, 'name')) value = { name: pkgName, ...value };
  const { name, type, path: relativePath } = value;

  ok(type, `target "${name}" is missing type. ${EXAMPLE}`);
  ok(
    relativePath,
    `target "${name}" (type = "${type}") is missing path. ${EXAMPLE}`
  );

  const path = join(dir, relativePath);

  return { name, type, path };
}
