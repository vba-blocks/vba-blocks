import { AST, Value, get } from './inspect';
import { Change } from './diff';

export default function applyChange(
  toml: string[],
  ast: AST,
  change: Change
): string[] {
  // TODO
  switch (change.kind) {
    case 'N':
      break;
    case 'D':
      break;
    case 'E':
      const node = get(ast, change.path!)!;
      replace(toml, node.value, change.rhs);

      break;
    case 'A':
      break;
    case 'R':
      break;
  }

  // TODO
  return toml;
}

function isMultiline(part: Value): boolean {
  return part.end.line > part.start.line;
}

function replace(toml: string[], value: Value, replacement: any) {
  if (isMultiline(value) || isObject(replacement)) return;

  const index = value.start.line - 1;
  const line = toml[index];
  toml[index] =
    line.substr(0, value.start.column - 1) +
    replacement +
    line.substr(value.end.column);
}

function toInlineTable(value: any): string {
  // TODO
  return '';
}

function isObject(value: any): boolean {
  return value != null && typeof value === 'object';
}
