const walkSync = require('walk-sync');
const { fs, path, zip, tar } = require('../lib/utils');

const { ensureDir } = fs;
const { extname, join, relative } = path;
const { zip } = require('../src/utils/zip');

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

  await zip(input, file);
}

async function mac() {
  const file = join(dist, `vba-blocks-mac.tar.gz`);
  const input = getInput('darwin');

  await tar(input, file);
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
  const compatibleExe = path =>
    platform === 'win32' ? extname(path) === '.exe' : extname(path) === '';

  const lib = ls(join(root, 'lib'));
  const addins = ls(join(root, 'addins/build')).filter(ignoreBackup);
  const run_scripts = ls(join(root, 'run-scripts')).filter(compatibleRunScript);
  const bin = ls(join(root, 'bin')).filter(compatibleBin);
  const vendor = ls(join(root, 'vendor')).filter(compatibleExe);
  const all_files = addins
    .concat(run_scripts)
    .concat(lib)
    .concat(bin)
    .concat(vendor);

  const input = {};
  for (const file of all_files) {
    input[file] = relative(root, file);
  }

  return input;
}

function ls(dir) {
  return walkSync(dir, { directories: false }).map(path => join(dir, path));
}
