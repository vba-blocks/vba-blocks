const { resolve, dirname, basename, extname, join } = require("path");
const mri = require("mri");
const { ensureDir, pathExists } = require("fs-extra");
const decompress = require("decompress");

main().catch(error => {
	console.error(error);
	process.exit(1);
});

// Usage: node scripts/unpack block [dest]
async function main() {
	const {
		_: [input, output]
	} = mri(process.argv.slice(2));

	const block = resolve(input);
	const dest = output ? resolve(output) : removeExtension(block);

	if (!(await pathExists(block))) {
		throw new Error(`Input block "${input}" not found`);
	}

	ensureDir(dest);
	await decompress(block, dest);
}

function removeExtension(path) {
	const dir = dirname(path);
	const base = basename(path, extname(path));

	return join(dir, base);
}
