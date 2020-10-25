import { join, normalize } from "../path";
import { pathExists as _pathExists, readFile as _readFile } from "fs-extra";

let filesystem: { [path: string]: null | Buffer } = {};
let index = 0;
export function reset() {
	filesystem = {};
	index = 0;
}

export const copy = jest.fn(async (from, to) => {
	from = normalize(from);
	to = normalize(to);

	if (filesystem[from] === null) throw ENOENT(from);
	const contents = filesystem[from] || (await _readFile(from));

	filesystem[to] = contents;
});

export const ensureDir = jest.fn(async () => {});
export const ensureDirSync = jest.fn(async () => {});

export const move = jest.fn(async (from, to) => {
	from = normalize(from);
	to = normalize(to);

	if (filesystem[from] === null) throw ENOENT(from);
	const contents = filesystem[from] || (await _readFile(from));

	filesystem[to] = contents;
	filesystem[from] = null;
});

export const pathExists = jest.fn(async (path: string) => {
	path = normalize(path);

	if (filesystem[path] === null) return false;
	if (filesystem[path]) return true;
	return await _pathExists(path);
});

export const readFile = jest.fn(async (path: string, encoding?: string) => {
	path = normalize(path);
	if (filesystem[path] === null) throw ENOENT(path);

	const data = filesystem[path] || (await _readFile(path));
	filesystem[path] = data;

	return encoding ? data.toString(encoding) : data;
});

export const readJson = jest.fn(async (path: string) => {
	path = normalize(path);
	if (filesystem[path] === null) throw ENOENT(path);

	const contents = filesystem[path] || (await readFile(path));
	return JSON.parse(contents.toString());
});

export const remove = jest.fn(async (path: string) => {
	path = normalize(path);
	filesystem[path] = null;
});

export interface TmpOptions {
	dir?: string;
	prefix?: string;
}

export const tmpFile = jest.fn(async (options: TmpOptions = {}) => {
	let { dir, prefix = "vba-blocks-" } = options;
	if (!dir) {
		({ tmpdir: dir } = require("tmp"));
	}

	return join(dir!, `${prefix}${index++}.tmp`);
});

export const tmpFolder = jest.fn(async (options: TmpOptions = {}) => {
	let { dir, prefix = "vba-blocks-" } = options;
	if (!dir) {
		({ tmpdir: dir } = require("tmp"));
	}

	return join(dir!, `${prefix}${index++}`);
});

export const writeFile = jest.fn(async (path: string, data: string | Buffer | null) => {
	path = normalize(path);

	filesystem[path] =
		data == null || Buffer.isBuffer(data) ? <Buffer | null>data : Buffer.from(data);
});

export interface NativeError extends Error {
	code?: string;
	path?: string;
}

function ENOENT(path: string): NativeError {
	const error: NativeError = new Error(`ENOENT: no such file or directory, open '${path}'`);
	error.code = "ENOENT";
	error.path = path;

	return error;
}
