const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const { resolve } = require('path');
const walkSync = require('walk-sync');
const { checksum, pathExists } = require('../lib/utils');

const isBackup = /\.backup/g;
const isBinary = /\.xlsm/g;

module.exports = async (cwd, command, args = {}) => {
  const bin = resolve(__dirname, '../bin/vba-blocks');
  const { stdout, stderr } = await exec(`node ${bin} ${command}`, { cwd });

  const files = walkSync(cwd, { directories: false });
  const details = {};
  await Promise.all(
    files.map(async file => {
      if (isBackup.test(file)) return;

      // TEMP Need reproducible builds to compare binary results
      if (isBinary.test(file)) {
        details[file] = '<TODO>';
      } else {
        details[file] = await checksum(resolve(cwd, file));
      }
    })
  );

  return {
    __result: true,
    details
  };
};
