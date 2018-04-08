import { parse as parseToml } from 'toml';
import { graceful as detectNewline } from 'detect-newline';
import inspect, { Node, AST } from './inspect';
import diff, { Change, getObjectId } from './diff';
import applyChange from './apply-change';
import { toLines } from './utils';

export { Node, AST, Change, getObjectId };

export interface Options {
  getId?: getObjectId;
  trailingComma?: boolean;
}

export function parse(toml: string): any {
  return parseToml(toml);
}

export function convert(value: any, options: Options = {}): string {
  return patch('', value, options);
}

export function patch(toml: string, value: any, options: Options = {}): string {
  const lines = toLines(toml);
  const newline = detectNewline(toml);

  const existing = parse(toml);
  const changes = diff(existing, value, options);

  // applyChange works directly on lines and does not update AST as-needed
  // meaning the AST has to be re-calculated for each change
  //
  // This is not ideal, but the assumption is that patches will be small and infrequent
  const result = changes.reduce((lines, change) => {
    const ast = inspect(lines.join(newline));
    return applyChange(lines, ast, change);
  }, lines);

  return result.join(newline);
}
