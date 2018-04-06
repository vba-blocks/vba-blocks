import { Change } from 'deep-diff';
import { graceful as detectNewline } from 'detect-newline';

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
  return new AST(toml, nodes);
}

export class AST {
  nodes: Node[];
  lines: string[];
  newline: string;

  constructor(toml: string, nodes: Node[]) {
    this.nodes = nodes;
    this.lines = toml.replace(/\r/g, '').split('\n');
    this.newline = detectNewline(toml);
  }

  applyChanges(changes: Change[]) {
    for (const change of changes) {
      console.log(change.kind, change.path, change);
    }
  }

  toToml(): string {
    // TODO
    return this.lines.join(this.newline);
  }
}

/*

[
  {
    "type": "ObjectPath",
    "value": [
      "package"
    ],
    "line": 1,
    "column": 1
  },
  {
    "type": "Assign",
    "value": {
      "type": "String",
      "value": "package-name",
      "line": 2,
      "column": 8
    },
    "line": 2,
    "column": 1,
    "key": "name"
  },
  {
    "type": "Assign",
    "value": {
      "type": "String",
      "value": "0.0.0",
      "line": 3,
      "column": 11
    },
    "line": 3,
    "column": 1,
    "key": "version"
  },
  {
    "type": "Assign",
    "value": {
      "type": "Array",
      "value": [
        {
          "type": "String",
          "value": "Author 1",
          "line": 4,
          "column": 12
        }
      ],
      "line": 4,
      "column": 11
    },
    "line": 4,
    "column": 1,
    "key": "authors"
  },
  {
    "type": "ObjectPath",
    "value": [
      "dependencies"
    ],
    "line": 12,
    "column": 1
  },
  {
    "type": "Assign",
    "value": {
      "type": "String",
      "value": "1.0.0",
      "line": 13,
      "column": 5
    },
    "line": 13,
    "column": 1,
    "key": "a"
  },
  {
    "type": "Assign",
    "value": {
      "type": "InlineTable",
      "value": [
        {
          "type": "InlineTableValue",
          "value": {
            "type": "String",
            "value": "...git",
            "line": 14,
            "column": 13
          },
          "line": 14,
          "column": 7,
          "key": "git"
        },
        {
          "type": "InlineTableValue",
          "value": {
            "type": "String",
            "value": "weird",
            "line": 14,
            "column": 38
          },
          "line": 14,
          "column": 25,
          "key": "spacing"
        }
      ],
      "line": 14,
      "column": 5
    },
    "line": 14,
    "column": 1,
    "key": "b"
  },
  {
    "type": "ObjectPath",
    "value": [
      "dependencies",
      "c"
    ],
    "line": 16,
    "column": 1
  },
  {
    "type": "Assign",
    "value": {
      "type": "String",
      "value": "...path",
      "line": 17,
      "column": 8
    },
    "line": 17,
    "column": 1,
    "key": "path"
  },
  {
    "type": "ArrayPath",
    "value": [
      "array"
    ],
    "line": 19,
    "column": 1
  },
  {
    "type": "Assign",
    "value": {
      "type": "Integer",
      "value": 0,
      "line": 20,
      "column": 9
    },
    "line": 20,
    "column": 1,
    "key": "index"
  },
  {
    "type": "ArrayPath",
    "value": [
      "array"
    ],
    "line": 22,
    "column": 1
  },
  {
    "type": "Assign",
    "value": {
      "type": "Integer",
      "value": 1,
      "line": 23,
      "column": 9
    },
    "line": 23,
    "column": 1,
    "key": "index"
  }
]

*/
