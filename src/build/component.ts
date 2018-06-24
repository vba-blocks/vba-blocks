import { extname } from 'path';
import { Manifest, Source } from '../manifest';
import { readFile } from '../utils';
import { unrecognizedComponent } from '../errors';

export type ComponentType = 'module' | 'class' | 'form' | 'document';

export interface ComponentMetadata {
  manifest?: Manifest;
  source?: Source;
}

export class Component {
  code: string;
  type: ComponentType;
  binary: Buffer | undefined;
  metadata: ComponentMetadata;

  constructor(options: {
    code: Buffer | string;
    type: ComponentType;
    binary?: Buffer;
    manifest?: Manifest;
    source?: Source;
  }) {
    const { code, type, binary, manifest, source } = options;

    this.code = code && Buffer.isBuffer(code) ? code.toString() : code;
    this.type = type;
    this.binary = binary;
    this.metadata = { manifest, source };
  }

  get name(): string {
    // TODO Load from code
    return this.metadata.source!.name;
  }

  get binary_path(): string | undefined {
    // TODO Load from code
    return this.metadata.source!.binary;
  }

  get filename(): string {
    const extension = typeToExtension(this.type);
    return `${this.name}${extension}`;
  }

  static async load(manifest: Manifest, source: Source): Promise<Component> {
    const type = extensionToType(extname(source.path));
    if (!type) {
      throw unrecognizedComponent(source.path);
    }

    const code = await readFile(source.path);
    const binary = <Buffer | undefined>(source.binary &&
      (await readFile(source.binary)));

    return new Component({ code, type, binary, manifest, source });
  }
}

const extension_to_type: { [extension: string]: ComponentType } = {
  '.bas': 'module',
  '.cls': 'class',
  '.frm': 'form'
};
const type_to_extension: { [type: string]: string } = {
  module: '.bas',
  class: '.cls',
  form: '.frm'
};

export function extensionToType(extension: string): ComponentType | undefined {
  return extension_to_type[extension];
}

export function typeToExtension(type: ComponentType): string | undefined {
  return type_to_extension[type];
}
