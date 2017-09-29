import * as assert from 'assert';
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

export function parseTargets(values: any[], pkgName: string): Target[] {
  assert.ok(Array.isArray(values), `targets must be an array. ${EXAMPLE}`);

  return values.map(value => parseTarget(value, pkgName));
}

export function parseTarget(value: any, pkgName: string): Target {
  if (!has(value, 'name')) value = { name: pkgName, ...value };
  const { name, type, path } = value;

  assert.ok(type, `target "${name}" is missing type. ${EXAMPLE}`);
  assert.ok(
    path,
    `target "${name}" (type = "${type}") is missing path. ${EXAMPLE}`
  );

  return { name, type, path };
}
