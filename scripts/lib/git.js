const { promisify } = require("util");
const execFile = promisify(require("child_process").execFile);

const remote = "https://github.com/vba-blocks/registry.git";

module.exports = {
	async pull({ dir }) {
		try {
			await execFile("git", ["pull"], { cwd: dir });
		} catch (error) {
			throw new Error(`git pull failed in "${dir}". ${error.message}`);
		}
	},

	async commit({ dir, message }) {
		try {
			await execFile("git", ["add", "-A"], { cwd: dir });
			await execFile("git", ["commit", "-am", message], { cwd: dir });
		} catch (error) {
			throw new Error(
				`git add -A && git commit -am "${message}" failed in "${dir}". ${error.message}`
			);
		}
	},

	async push({ dir }) {
		try {
			await execFile("git", ["push"], { cwd: dir });
		} catch (error) {
			throw new Error(`git push failed in "${dir}". ${error.message}`);
		}
	},

	async clone({ dir }) {
		try {
			console.log(`git clone ${remote} registry`, dir);
			await execFile("git", ["clone", remote, "registry"], { cwd: dir });
		} catch (error) {
			throw new Error(`git clone failed in "${dir}". ${error.message}`);
		}
	}
};
