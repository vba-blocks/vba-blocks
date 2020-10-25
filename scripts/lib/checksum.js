const { readFile } = require("fs-extra");
const hash = require("./hash");

module.exports = async function checksum(file, algorithm = "sha256") {
	const data = await readFile(file);
	return hash(data, { algorithm });
};
