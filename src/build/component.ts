import { CliError, ErrorCode } from "../errors";
import { readFile } from "../utils/fs";
import { extname } from "../utils/path";
import { BY_LINE } from "../utils/text";

export type ComponentType = "module" | "class" | "form" | "document";

export interface ComponentDetails {
	path?: string;
	binary?: Buffer;
}

export class Component {
	type: ComponentType;
	code: string;
	details: ComponentDetails;

	constructor(type: ComponentType, code: Buffer | string, details: ComponentDetails = {}) {
		this.type = type;
		this.code = code && Buffer.isBuffer(code) ? code.toString() : code;
		this.details = details;
	}

	get name(): string {
		const line = findLine(this.code, "Attribute VB_Name");
		if (!line) {
			throw new CliError(
				ErrorCode.ComponentInvalidNoName,
				`Invalid component: No attribute VB_Name found.`
			);
		}

		const [key, value] = line.split("=");
		return JSON.parse(value);
	}

	get binaryPath(): string | undefined {
		const line = findLine(this.code, "OleObjectBlob");
		if (!line) return;

		const [key, value] = line.split("=", 2);
		const [path, offset] = value.split(":", 2);
		return JSON.parse(path);
	}

	get filename(): string {
		const extension = typeToExtension[this.type];
		return `${this.name}${extension}`;
	}

	static async load(path: string, details: { binary_path?: string } = {}): Promise<Component> {
		const { binary_path } = details;

		const type = extensionToType[extname(path)];
		if (!type) {
			throw new CliError(
				ErrorCode.ComponentUnrecognized,
				`Unrecognized component extension "${extname(path)}" (at "${path}").`
			);
		}

		const code = await readFile(path);
		const binary = <Buffer | undefined>(binary_path && (await readFile(binary_path)));

		return new Component(type, code, { path, binary });
	}
}

export const extensionToType: { [extension: string]: ComponentType } = {
	".bas": "module",
	".cls": "class",
	".frm": "form"
};
export const typeToExtension: { [type: string]: string } = {
	module: ".bas",
	class: ".cls",
	form: ".frm"
};

function findLine(code: string, search: string): string | undefined {
	const lines = code.split(BY_LINE).map(line => line.trim());
	return lines.find(line => line.startsWith(search));
}

export function byComponentName(a: Component, b: Component): number {
	if (a.name < b.name) return -1;
	if (a.name > b.name) return 1;
	return 0;
}
