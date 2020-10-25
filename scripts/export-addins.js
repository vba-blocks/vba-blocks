const { join } = require("path");
const vba = require("../lib/index");

main().catch(err => {
	console.error(err);
	process.exit(1);
});

async function main() {
	await vba.exportProject({
		addin: join(__dirname, "bootstrap/build/bootstrap.xlsm")
	});
}
