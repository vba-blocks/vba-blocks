import { extname, relative } from '../utils/path';
import { readFile } from '../utils/fs';
import { unrecognizedComponent } from '../errors';

export type ComponentType = 'module' | 'class' | 'form' | 'document';

export interface ComponentDetails {
  path?: string;
  dependency?: string;
  binary?: Buffer;
}

export class Component {
  type: ComponentType;
  code: string;
  details: ComponentDetails;

  constructor(
    type: ComponentType,
    code: Buffer | string,
    details: ComponentDetails = {}
  ) {
    this.type = type;
    this.code = code && Buffer.isBuffer(code) ? code.toString() : code;
    this.details = details;
  }

  get name(): string {
    const line = findLine(this.code, 'Attribute VB_Name');
    if (!line) throw new Error('No attribute VB_Name found in component');

    const [key, value] = line.split('=');
    return JSON.parse(value);
  }

  get binary_path(): string | undefined {
    const line = findLine(this.code, 'OleObjectBlob');
    if (!line) return;

    const [key, value] = line.split('=', 2);
    const [path, offset] = value.split(':', 2);
    return JSON.parse(path);
  }

  get filename(): string {
    const extension = type_to_extension[this.type];
    return `${this.name}${extension}`;
  }

  static async load(
    path: string,
    details: { dependency?: string; binary_path?: string } = {}
  ): Promise<Component> {
    const { dependency, binary_path } = details;

    const type = extension_to_type[extname(path)];
    if (!type) {
      throw unrecognizedComponent(path);
    }

    const code = await readFile(path);
    const binary = <Buffer | undefined>(
      (binary_path && (await readFile(binary_path)))
    );

    return new Component(type, code, { path, dependency, binary });
  }
}

export const extension_to_type: { [extension: string]: ComponentType } = {
  '.bas': 'module',
  '.cls': 'class',
  '.frm': 'form'
};
export const type_to_extension: { [type: string]: string } = {
  module: '.bas',
  class: '.cls',
  form: '.frm'
};

const BY_LINE = /(?:\r\n|\r|\n)/g;

function findLine(code: string, search: string): string | undefined {
  const lines = code.split(BY_LINE).map(line => line.trim());
  return lines.find(line => line.startsWith(search));
}

export function byComponentName(a: Component, b: Component): number {
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
}
