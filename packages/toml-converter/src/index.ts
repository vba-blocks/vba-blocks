import { parse as parseToml } from 'toml';
import { diff } from 'deep-diff';
import inspect from './inspect';

export function parse(toml: string): any {
  return parseToml(toml);
}

export function convert(value: any): string {
  // TODO
  return '';
}

export function patch(toml: string, value: any): string {
  const existing = parse(toml);
  const changes = diff(existing, value);

  const ast = inspect(toml);
  ast.applyChanges(changes);

  return ast.toToml();
}
