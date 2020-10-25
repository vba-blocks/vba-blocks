const { createHash } = require("crypto");

module.exports = function hash(data, options = {}) {
	const { algorithm = "sha256", digest = "hex", prefix = true } = options;

	return `${prefix ? `${algorithm}-` : ""}${createHash(algorithm)
		.update(data)
		.digest(digest)}`;
};
