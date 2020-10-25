const { createWriteStream } = require("fs");
const { create: createArchive } = require("archiver");

module.exports = async function zip(input, dest, type = "zip", options = {}) {
	return new Promise((resolve, reject) => {
		try {
			const output = createWriteStream(dest);
			const archive = createArchive(type, options);

			output.on("close", resolve);
			output.on("error", reject);

			archive.pipe(output);
			archive.on("error", reject);

			for (const [path, name] of Object.entries(input)) {
				archive.file(path, { name });
			}

			archive.finalize();
		} catch (err) {
			reject(err);
		}
	});
};
