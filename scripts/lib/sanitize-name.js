const sanitizeFilename = require("sanitize-filename");

module.exports = function sanitizeName(name) {
	return sanitizeFilename(name.replace("/", "--"), { replacement: "-" });
};
