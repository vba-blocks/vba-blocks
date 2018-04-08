import { Path } from 'deep-diff';
import { graceful as detectNewline } from 'detect-newline';
import { Change } from './diff';

const { parse: inspectToml } = require('toml/lib/parser');
const { compile: compileToml } = require('toml/lib/compiler');

export interface Node {
  type:
    | 'ObjectPath'
    | 'ArrayPath'
    | 'Assign'
    | 'String'
    | 'Float'
    | 'Integer'
    | 'Boolean'
    | 'Array'
    | 'InlineTable'
    | 'InlineTableValue'
    | 'Date';
  line: number;
  column: number;
  value: any;
  key?: string;
}

export default function inspect(toml: string): AST {
  const nodes: Node[] = inspectToml(toml);
  const landmarks = toLandmarks(nodes);

  // TODO
  return {};
}

// TODO Unify landmarks and AST

export interface AST {}

export type Landmarks = { [key: string]: Landmark } | Landmark[];
export interface Landmark {
  node: Node;
  inline?: Node;
  children?: Landmarks;
}

export function toLandmarks(nodes: Node[]): Landmarks | Landmark {
  const landmarks = {};
  let active = landmarks;

  for (const node of nodes) {
    // For inline tables and arrays, need to store some additional information
    // store in `inline` value
    const inline =
      node.value.type === 'InlineTable' || node.value.type === 'Array'
        ? node.value
        : null;

    switch (node.type) {
      case 'ObjectPath':
        // { "value": ["package"] }
        active = {};
        set(landmarks, node.value, { node, children: active });
        break;
      case 'ArrayPath':
        // { "value": ["array"] }
        active = {};
        push(landmarks, node.value, { node, children: active });
        break;
      case 'Assign':
      case 'InlineTableValue':
        // { "key": "name", "value": { "type": "String", "value": "package-name" }
        const children = toLandmarks([node.value]);
        set(
          active,
          [node.key!],
          inline ? { node, inline, children } : { node, children }
        );
        break;

      case 'InlineTable':
        return toLandmarks(node.value);
      case 'Array':
        return node.value.map((value: any) => toLandmarks([value]));

      case 'String':
      case 'Float':
      case 'Integer':
      case 'Boolean':
      case 'Date':
        return { node };

      default:
        throw new Error(`Unrecognized node landmark type "${node.type}"`);
    }
  }

  return landmarks;
}

function get(object: any, path: Path): any {
  if (!object) return undefined;
  object = object[path[0]];

  for (const part of path.slice(1)) {
    if (!object || !object.children) return undefined;
    object = object.children[part];
  }
  return object;
}

export function set(object: any, path: Path, value: any) {
  if (path.length === 1) {
    object[path[0]] = value;
  } else {
    const parent = get(object, path.slice(0, -1));
    if (!parent || !parent.children)
      throw new Error(`Could not find path ${path} in object`);

    const key = path[path.length - 1];
    parent.children[key] = value;
  }

  return value;
}

export function push(object: any, path: Path, value: any) {
  const array = get(object, path) || set(object, path, []);
  array.push(value);
}
