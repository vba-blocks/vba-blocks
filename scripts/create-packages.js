const { join, relative, basename } = require('path');
const { createWriteStream } = require('fs');
const { ensureDir } = require('fs-extra');
const { create: createArchive } = require('archiver');
const walkSync = require('walk-sync');
const {
  versions: { node: node_version }
} = require('./ensure-vendor');

const { version } = require('../package.json');
const root = join(__dirname, '../');
const dist = join(root, 'dist');

main().catch(err => {
  console.error(err);
  process.exit(1);
});

async function main() {
  await ensureDir(dist);
  await windows();
  await mac();
}

async function windows() {
  const file = join(dist, `vba-blocks-win.zip`);
  const input = getInput('win32');

  const exe = join(root, 'scripts/vendor', `node-${node_version}`, 'node.exe');
  input[exe] = 'node.exe';

  await zip(input, file);
}

async function mac() {
  const file = join(dist, `vba-blocks-mac.zip`);
  const input = getInput('darwin');

  const exe = join(root, 'scripts/vendor', `node-${node_version}`, 'node');
  input[exe] = 'node';

  await zip(input, file);
}

function getInput(platform) {
  const ignoreBackup = path => !/\.backup/.test(path);
  const isVBS = path => /\.vbs/.test(path);
  const isAppleScript = path => /\.applescript/.test(path);
  const compatibleRunScript = path => (platform === 'win32' ? isVBS(path) : isAppleScript(path));
  const isCmd = path => /\.cmd/.test(path);
  const isPowershell = path => /\.ps1/.test(path);
  const isShell = path => !isCmd(path) && !isPowershell(path);
  const compatibleBin = path =>
    platform === 'win32' ? isCmd(path) || isPowershell(path) : isShell(path);

  const lib = ls(join(root, 'lib'));
  const addins = ls(join(root, 'addins/build')).filter(ignoreBackup);
  const run_scripts = ls(join(root, 'run-scripts')).filter(compatibleRunScript);
  const bin = ls(join(root, 'scripts/bin')).filter(compatibleBin);

  const input = {};
  for (const file of addins.concat(run_scripts).concat(lib)) {
    input[file] = relative(root, file);
  }
  for (const file of bin) {
    input[file] = join('bin', basename(file));
  }

  return input;
}

async function zip(input, dest) {
  return new Promise((resolve, reject) => {
    try {
      const output = createWriteStream(dest);
      const archive = createArchive('zip');

      output.on('close', resolve);
      output.on('error', reject);

      archive.pipe(output);
      archive.on('error', reject);

      for (const [path, name] of Object.entries(input)) {
        archive.file(path, { name });
      }

      archive.finalize();
    } catch (err) {
      reject(err);
    }
  });
}

function ls(dir) {
  return walkSync(dir, { directories: false }).map(path => join(dir, path));
}
