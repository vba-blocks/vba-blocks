import * as assert from 'assert';
import { has } from '../utils';

export type TargetType = 'xlsx' | 'xlsm' | 'xlam';

export interface Target {
  name: string;
  type: TargetType;
  path: string;
}

export function parseTargets(values: any[], pkgName: string): Target[] {
  return values.map(value => parseTarget(value, pkgName));
}

export function parseTarget(value: any, pkgName: string): Target {
  if (!has(value, 'name')) value = Object.assign({ name: pkgName }, value);
  const { name, type, path } = value;

  assert.ok(type, `target "${name}" is missing type`);
  assert.ok(path, `target "${name},${type}" is missing path`);

  return { name, type, path };
}
