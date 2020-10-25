const { join, relative, extname } = require("path");
const { ensureDir } = require("fs-extra");
const ls = require("./lib/ls");
const zip = require("./lib/zip");

const root = join(__dirname, "../");
const dist = join(root, "dist");

main().catch(err => {
	console.error(err);
	process.exit(1);
});

async function main() {
	await ensureDir(dist);
	await windows();
	await mac();
}

async function windows() {
	const file = join(dist, `vba-blocks-win.zip`);
	const input = getInput("win32");

	await zip(input, file);
}

async function mac() {
	const file = join(dist, `vba-blocks-mac.tar.gz`);
	const input = getInput("darwin");

	await zip(input, file, "tar", { gzip: true });
}

function getInput(platform) {
	const ignoreBackup = path => !/\.backup/.test(path);
	const isVBS = path => /\.vbs/.test(path);
	const isAppleScript = path => /\.applescript/.test(path);
	const compatibleRunScript = path => (platform === "win32" ? isVBS(path) : isAppleScript(path));
	const isCmd = path => /\.cmd/.test(path);
	const isPowershell = path => /\.ps1/.test(path);
	const isShell = path => !isCmd(path) && !isPowershell(path);
	const compatibleBin = path =>
		platform === "win32" ? isCmd(path) || isPowershell(path) : isShell(path);
	const compatibleExe = path =>
		platform === "win32" ? extname(path) === ".exe" : extname(path) === "";

	const lib = ls(join(root, "lib"));
	const addins = ls(join(root, "addins/build")).filter(ignoreBackup);
	const run_scripts = ls(join(root, "run-scripts")).filter(compatibleRunScript);
	const bin = ls(join(root, "bin")).filter(compatibleBin);
	const vendor = ls(join(root, "vendor")).filter(compatibleExe);

	const input = {};
	for (const file of addins
		.concat(run_scripts)
		.concat(lib)
		.concat(bin)
		.concat(vendor)) {
		input[file] = relative(root, file);
	}

	return input;
}
