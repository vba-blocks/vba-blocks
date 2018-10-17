const { promisify } = require('util');
const { join, dirname } = require('path');
const exec = promisify(require('child_process').exec);
const {
  readFile,
  writeFile,
  move,
  remove,
  copy,
  ensureDir
} = require('fs-extra');
const { render } = require('mustache');

const { version } = require('../package.json');
const is_windows = process.platform === 'win32';
const fileicon = join(__dirname, '../node_modules/.bin/fileicon');
const icons = {
  mac: join(__dirname, '../installer/icons/vba-blocks.icns'),
  windows: join(__dirname, '../installer/icons/vba-blocks.ico')
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});

async function main() {
  if (is_windows) {
    await wix();
  } else {
    await app();
    await pkg();
  }
}

async function wix() {
  const cwd = join(__dirname, '../installer');
  const template = await readFile(
    join(__dirname, '../installer/template.wxs'),
    'utf8'
  );
  const input = render(template, { version });
  await writeFile(
    join(__dirname, '../installer/vba-blocks.wxs'),
    input,
    'utf8'
  );

  await exec('vendor\\wix\\candle vba-blocks.wxs', { cwd });
  await exec('vendor\\wix\\light vba-blocks.wixobj', { cwd });

  const dist = join(__dirname, `../dist/vba-blocks-v${version}.msi`);
  await remove(dist);
  await move(join(__dirname, '../installer/vba-blocks.msi'), dist);
}

async function app() {
  // Add icon to bin/vba-blocks
  const bin = join(__dirname, '../dist/unpacked/bin/vba-blocks');
  await exec(`"${fileicon}" set "${bin}" "${icons.mac}"`);

  // Create .app from applescript
  const script = join(__dirname, '../installer/vba-blocks.applescript');
  const app = join(__dirname, '../dist/app/vba-blocks.app');

  await remove(app);
  await ensureDir(dirname(app));
  await exec(`osacompile -o "${app}" "${script}"`);

  // Copy add-ins, bin, etc. to .app
  await copy(join(__dirname, '../dist/unpacked'), app);

  // Set icon on .app
  await exec(`"${fileicon}" set "${app}" "${icons.mac}"`);
}

async function pkg() {
  const identifier = 'com.vba-blocks.pkg.app';
  const root = join(__dirname, '../dist/app/');
  const scripts = join(__dirname, '../installer/scripts');
  const output = join(__dirname, `../dist/vba-blocks ${version}.pkg`);

  // TODO --sign
  await exec(
    `pkgbuild --identifier ${identifier} --root "${root}" --version ${version} --scripts "${scripts}" --install-location /Applications "${output}"`
  );
}
