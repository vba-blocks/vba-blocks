import {
	join as _join,
	normalize as _normalize,
	relative as _relative,
	resolve as _resolve
} from "path";
import sanitizeFilename from "sanitize-filename";

export { basename, dirname, extname } from "path";

const WINDOWS_REGEX = /\\/g;
const LEADING_SLASH = "./";

export function join(...parts: string[]): string {
	return normalize(_join(...parts));
}

export function normalize(value: string): string {
	let normalized = _normalize(value).replace(WINDOWS_REGEX, "/");
	if (value.startsWith(LEADING_SLASH)) normalized = LEADING_SLASH + normalized;

	return normalized;
}

export function relative(from: string, to: string): string {
	return normalize(_relative(from, to));
}

export function resolve(...parts: string[]): string {
	return normalize(_resolve(...parts));
}

export function sanitize(name: string): string {
	return sanitizeFilename(name, { replacement: "-" });
}

export function trailing(value: string): string {
	return value.endsWith("/") ? value : `${value}/`;
}
