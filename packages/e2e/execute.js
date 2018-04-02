const { resolve } = require('path');
const walkSync = require('walk-sync');
const env = require('../cli/lib/env').default;
const { checksum, pathExists } = require('../cli/lib/utils');

const isBackup = /\.backup/g;
const isBinary = /\.xlsm/g;

module.exports = async (cwd, command, args = {}) => {
  env.cwd = cwd;

  const execute = require(`../cli/bin/vba-blocks-${command}`);
  await execute(args);

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
