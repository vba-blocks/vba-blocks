import { Path, Index } from 'deep-diff';
import { graceful as detectNewline } from 'detect-newline';
import { Change } from './diff';
import { toLines } from './utils';

// Use __internal__ parsing from toml library
// (this should not be assumed to be stable and a specific version may need to be pinned)
export interface ParsedNode {
  type:
    | 'ObjectPath'
    | 'ArrayPath'
    | 'Assign'
    | 'InlineTable'
    | 'InlineTableValue'
    | 'Array'
    | 'String'
    | 'Float'
    | 'Integer'
    | 'Boolean'
    | 'Date';

  line: number;
  column: number;
  value: any;
  key?: string;
}

const parseToml: (toml: string) => ParsedNode[] = require('toml/lib/parser')
  .parse;

/*
  Approach: Arrange nodes into AST tree and add end information

  Example:
  ```toml
    123456789
  1 [package]
  2 name = "value"
  3 authors = ["a", "b"]
  4
  5 [dependencies.a]
  6 git = { path = "...", tag = "v1.0.0" }
  ```

  ```js
  {
    package: {
      key: {
        start: { line: 1, column: 1 },
        end: { line: 1, column 9 },
        parsed: (from toml = package)
      },
      value: {
        start: { line: 2, column: 1 },
        end: { line: 4, column: 1 },
        parsed: (from toml)
      },
      children: {
        name: {
          key: { start: { ... }, end: { ... }, parsed: (name)},
          value: { start: { ... }, end: { ... }, parsed: (value)}
        },
        authors: {
          key: { ... },
          value: { ... },
          children: [
            { key: null, value: { ..., parsed: (a) } },
            { key: null, value: { ..., parsed: (b) } }
          ]
        }
      }
    },
    dependencies: {
      key: null,
      value: { start: { line: 5 }, ...},
      children: {
        a: {
          key: { ... },
          value: { ... },
          children: {
            git: {
              key: { end: { line: 6, column: 3 } },
              value: { ... },
              children: {
                path: {
                  key: { ... },
                  value: { ..., parsed: (...) }
                },
                tag: {
                  key: { ... },
                  value: { ..., parsed: (v1.0.0) }
                }
              }
            }
          }
        }
      }
    }
  }
  ```
*/

export type AST = KeyedNodes;

export interface KeyedNodes {
  [key: string]: Node;
}
export type IndexedNodes = Node[];

export interface Node {
  key?: Value;
  value: Value;
  children?: KeyedNodes | IndexedNodes;
}

export interface Value {
  start: Position;
  end: Position;
  parsed?: ParsedNode;
}

export interface Position {
  line: number;
  column: number;
}

export default function inspect(toml: string): AST {
  const lines = toLines(toml);
  const nodes: ParsedNode[] = parseToml(lines.join('\n'));
  return <KeyedNodes>walk(nodes, lines);
}

function walk(parsed: ParsedNode[], lines: string[]): KeyedNodes {
  let nodes: KeyedNodes = {};
  let current: KeyedNodes = nodes;

  for (const [index, node] of parsed.entries()) {
    let { line, column } = node;
    let key: null | Value;
    let value: Value;
    let children: KeyedNodes | IndexedNodes;
    let result: Node;

    let next_node: ParsedNode | undefined;
    let end_line: number;
    let end_of_key: number;
    let end_of_value: number;

    switch (node.type) {
      case 'ObjectPath':
      case 'ArrayPath':
        // Parsed ArrayPath points to first line of values (not key)
        // if (node.type === 'ArrayPath') line -= 1;

        // { "value": ["package"] }
        next_node = parsed.find(
          (node, _index) => _index > index && isPathNode(node)
        );
        end_line = next_node ? next_node.line - 1 : lines.length;

        // TODO something is wrong with end.column position (-> line length)

        result = {
          key: {
            start: { line, column },
            end: { line, column: lines[line - 1].length },
            parsed: node
          },
          value: {
            start: { line: line + 1, column: 0 },
            end: { line: end_line, column: lines[end_line - 1].length }
          },
          children: {}
        };

        current = <KeyedNodes>result.children;

        node.type === 'ObjectPath'
          ? set(nodes, node.value, result)
          : push(nodes, node.value, result);

        break;

      case 'Assign':
        // { "key": "name", "value": { "type": "String", "value": "package-name" }
        next_node = parsed[index + 1];
        end_line = next_node ? next_node.line - 1 : lines.length;
        end_of_key = findCharColumn(lines[line - 1], '=', {
          from: column,
          fallback: column + node.key!.length
        });

        result = {
          key: {
            start: { line, column },
            end: { line, column: end_of_key },
            parsed: node
          },
          value: {
            start: { line, column: end_of_key + 1 },
            end: { line: end_line, column: lines[end_line - 1].length },
            parsed: node.value
          },
          children: toChildren(node.value, lines)
        };

        set(current, [node.key!], result);

        break;

      case 'InlineTableValue':
        // { "key": "name", "value": { "type": "String", "value": "package-name" }
        end_of_key = findCharColumn(lines[line - 1], '=', {
          from: column,
          fallback: column + node.key!.length
        });
        end_of_value = findCharColumn(lines[line - 1], [',', '}'], {
          from: end_of_key
        });

        result = {
          key: {
            start: { line, column },
            end: { line, column: end_of_key },
            parsed: node
          },
          value: {
            start: { line, column: end_of_key + 1 },
            end: { line, column: end_of_value },
            parsed: node.value
          },
          children: toChildren(node.value, lines)
        };

        set(current, [node.key!], result);

        break;

      default:
        throw new Error(
          `Unrecognized/unhandled parsed node with type "${node.type}"`
        );
    }
  }

  return nodes;
}

function toChildren(
  value: ParsedNode,
  lines: string[]
): KeyedNodes | IndexedNodes | undefined {
  switch (value.type) {
    case 'InlineTable':
      return walk(value.value, lines);
    case 'Array':
      return <IndexedNodes>value.value.map((child: ParsedNode) => {
        const { line, column } = child;
        const children = toChildren(child, lines);

        const end_line = Array.isArray(children)
          ? children[children.length - 1].value.end.line
          : line;
        const search_column = Array.isArray(children)
          ? children[children.length - 1].value.end.column
          : column;
        const end_of_value = findCharColumn(lines[end_line - 1], ',', {
          from: search_column
        });

        const value: Value = {
          start: { line, column },
          end: { line, column: end_of_value },
          parsed: child
        };

        return { value, children };
      });
    default:
      return;
  }
}

export function get(ast: AST, path: Path): Node | null {
  if (!path.length) return null;

  const [root, ...nested] = path;
  let node: Node = ast[root];

  for (const part of nested) {
    const children = node && node.children;
    if (!children) return null;

    node = Array.isArray(children)
      ? children[<number>part]
      : children[<string>part];
  }

  return node;
}

export function has(ast: AST, path: Path): boolean {
  return !!get(ast, path);
}

function set(ast: AST, path: Path, node: Node): Node {
  if (path.length === 1) {
    return (ast[path[0]] = node);
  }

  const key: string = <string>path[path.length - 1];
  const parent_path = path.slice(0, -1);
  let parent = get(ast, parent_path);

  if (!parent) {
    parent = {
      value: {
        start: node.key!.start,
        end: node.value.end
      },
      children: {}
    };

    set(ast, parent_path, parent);
  }
  if (!parent.children) {
    parent.children = {};
  }

  // Each time a new value is add to parent,
  // Ensure end location is up-to-date
  if (node.value.end.line > parent.value.end.line) {
    parent.value.end = node.value.end;
  }

  return ((<KeyedNodes>parent.children)[key] = node);
}

function push(ast: AST, path: Path, node: Node): Node {
  let parent = get(ast, path);

  if (!parent) {
    parent = {
      value: {
        start: node.key!.start,
        end: node.value.end
      },
      children: []
    };

    set(ast, path, parent);
  }
  if (!parent.children) {
    parent.children = [];
  }

  // Each time a new value is pushed onto path,
  // update the end position of the parent's value
  parent.value.end = node.value.end;
  (<IndexedNodes>parent.children!).push(node);

  return node;
}

function isPathNode(node: ParsedNode): boolean {
  return node.type === 'ObjectPath' || node.type === 'ArrayPath';
}

const QUOTE = '"';
const ESCAPE = '\\';

function findCharColumn(
  value: string,
  search: string | string[],
  options?: { from?: number; fallback?: number }
): number {
  const { from = 1, fallback = value.length } = options || {};

  if (!Array.isArray(search)) search = [search];
  for (const check of search) {
    let quoted = false;
    for (let i = from; i <= value.length; i++) {
      const char = value.charAt(i - 1);
      if (char === check && !quoted) return i;

      if (!quoted && char === QUOTE) quoted = true;
      if (quoted && char === QUOTE && value.charAt(i - 2) !== ESCAPE)
        quoted = false;
    }
  }

  return fallback;
}
