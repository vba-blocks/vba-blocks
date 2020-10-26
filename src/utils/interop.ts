export function getDefault(exports: any) {
	return "default" in exports ? exports.default : exports;
}
