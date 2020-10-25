const { dirname } = require("path");
const { createWriteStream } = require("fs");
const fetch = require("node-fetch");
const { ensureDir } = require("fs-extra");

module.exports = async function download(url, dest) {
	await ensureDir(dirname(dest));

	return fetch(url).then(response => {
		const file = createWriteStream(dest);

		return new Promise((resolve, reject) => {
			response.body
				.pipe(file)
				.on("finish", () => resolve())
				.on("error", reject);
		});
	});
};
