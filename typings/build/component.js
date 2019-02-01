import { extname, relative } from '../utils/path';
import { readFile } from '../utils/fs';
import { BY_LINE, truncate } from '../utils/text';
import { unrecognizedComponent, componentInvalidNoName } from '../errors';
export class Component {
    constructor(type, code, details = {}) {
        this.type = type;
        this.code = code && Buffer.isBuffer(code) ? code.toString() : code;
        this.details = details;
    }
    get name() {
        const line = findLine(this.code, 'Attribute VB_Name');
        if (!line)
            throw componentInvalidNoName();
        const [key, value] = line.split('=');
        return JSON.parse(value);
    }
    get binary_path() {
        const line = findLine(this.code, 'OleObjectBlob');
        if (!line)
            return;
        const [key, value] = line.split('=', 2);
        const [path, offset] = value.split(':', 2);
        return JSON.parse(path);
    }
    get filename() {
        const extension = type_to_extension[this.type];
        return `${this.name}${extension}`;
    }
    static async load(path, details = {}) {
        const { dependency, binary_path } = details;
        const type = extension_to_type[extname(path)];
        if (!type) {
            throw unrecognizedComponent(path);
        }
        const code = await readFile(path);
        const binary = (binary_path && (await readFile(binary_path)));
        return new Component(type, code, { path, dependency, binary });
    }
}
export const extension_to_type = {
    '.bas': 'module',
    '.cls': 'class',
    '.frm': 'form'
};
export const type_to_extension = {
    module: '.bas',
    class: '.cls',
    form: '.frm'
};
function findLine(code, search) {
    const lines = code.split(BY_LINE).map(line => line.trim());
    return lines.find(line => line.startsWith(search));
}
export function byComponentName(a, b) {
    if (a.name < b.name)
        return -1;
    if (a.name > b.name)
        return 1;
    return 0;
}
export function normalizeComponent(component, dir) {
    return {
        type: component.type,
        name: component.name,
        code: truncate(component.code, 200),
        details: {
            path: component.details.path && relative(dir, component.details.path),
            dependency: component.details.dependency
        },
        binary_path: component.binary_path,
        filename: component.filename
    };
}
