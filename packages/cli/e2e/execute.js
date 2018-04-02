const { resolve } = require('path');
const walkSync = require('walk-sync');
const env = require('../lib/env').default;
const { checksum, pathExists } = require('../lib/utils');

const isBackup = /\.backup/g;
const isBinary = /\.xlsm/g;

module.exports = async (cwd, command, args = {}) => {
  env.cwd = cwd;

  // TODO Run directly with fork
  const execute = require(`../bin/vba-blocks-${command}`);
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
