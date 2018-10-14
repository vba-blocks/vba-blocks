const { promisify } = require('util');
const { join } = require('path');
const exec = promisify(require('child_process').exec);
const { move, remove } = require('fs-extra');
const { version } = require('../package.json');
const is_windows = process.platform === 'win32';

main().catch(err => {
  console.error(err);
  process.exit(1);
});

async function main() {
  const cwd = join(__dirname, '../installer');

  if (is_windows) {
    await exec('..\\vendor\\wix\\candle vba-blocks.wxs', { cwd });
    await exec('..\\vendor\\wix\\light vba-blocks.wixobj', { cwd });

    const dist = join(__dirname, `../dist/vba-blocks-v${version}.msi`);
    await remove(dist);
    await move(join(__dirname, '../installer/vba-blocks.msi'), dist);
  }
}
