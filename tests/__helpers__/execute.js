const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const { resolve } = require('path');
const { copy, remove } = require('fs-extra');
const walkSync = require('walk-sync');
const tmp = require('tmp');
const { checksum, tmpFolder } = require('../../lib/utils');

const isBackup = /\.backup/g;
const isBinary = /\.xlsm/g;

module.exports = {
  async tmp(dir) {
    const path = await tmpFolder();
    await copy(dir, path);

    return { path, cleanup: () => remove(path) };
  },
  async execute(cwd, command) {
    const bin = resolve(__dirname, '../../lib/bin/vba-blocks');
    const { stdout, stderr } = await exec(`node ${bin} ${command}`, { cwd });

    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  },
  async check(dir) {
    const files = walkSync(dir, { directories: false });
    const details = {};
    const checking = files.map(async file => {
      if (isBackup.test(file)) return;

      // TEMP Need reproducible builds to compare binary results
      if (isBinary.test(file)) {
        details[file] = '<TODO>';
      } else {
        details[file] = await checksum(resolve(dir, file));
      }
    });
    await Promise.all(checking);

    return {
      __result: true,
      details
    };
  }
};
