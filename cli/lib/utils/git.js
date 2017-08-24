const { GitProcess } = require('dugite');

async function clone(remote, name, cwd) {
  return GitProcess.exec(['clone', '--depth', '1', remote, name], cwd);
}

async function pull(local) {
  return GitProcess.exec(['pull'], local);
}

module.exports = { clone, pull };
