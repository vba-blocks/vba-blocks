const { promisify } = require('util');
const execFile = promisify(require('child_process').execFile);

module.exports = {
  async pull({ dir }) {
    try {
      await execFile('git', ['pull'], { cwd: dir });
    } catch (error) {
      throw new Error(`git pull failed in "${dir}". ${error.message}`);
    }
  },
  async commit({ dir, message }) {
    try {
      await execFile('git', ['add', '-A']);
    } catch (error) {
      throw new Error(
        `git add -A && git commit -am "${message}" failed in "${dir}". ${error.message}`
      );
    }
  },
  async push({ dir }) {
    try {
      await execFile('git', ['push']);
    } catch (error) {
      throw new Error(`git push failed in "${dir}". ${error.message}`);
    }
  }
};
