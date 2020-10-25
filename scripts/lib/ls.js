const { join } = require("path");
const walkSync = require("walk-sync");

module.exports = function ls(dir) {
	return walkSync(dir, { directories: false }).map(path => join(dir, path));
};
