const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const { resolve } = require('path');
const { copy, remove } = require('fs-extra');
const walkSync = require('walk-sync');
const tmp = require('tmp');
const { checksum, tmpFolder } = require('../../lib/utils');

const isBackup = /\.backup/g;
const isBinary = /\.xlsm/g;

module.exports = async (dir, command, args = {}) => {
  const { path: cwd, cleanup } = await tmpDir();

  try {
    await copy(dir, cwd);

    const bin = resolve(__dirname, '../../bin/vba-blocks');
    await exec(`node ${bin} ${command}`, { cwd });

    const files = walkSync(cwd, { directories: false });
    const details = {};
    const checking = files.map(async file => {
      if (isBackup.test(file)) return;

      // TEMP Need reproducible builds to compare binary results
      if (isBinary.test(file)) {
        details[file] = '<TODO>';
      } else {
        details[file] = await checksum(resolve(cwd, file));
      }
    });

    await Promise.all(checking);
    await cleanup();

    return {
      __result: true,
      details
    };
  } catch (err) {
    await cleanup();
    throw err;
  }
};

async function tmpDir() {
  const path = await tmpFolder();
  const cleanup = () => remove(path);

  return { path, cleanup };
}
