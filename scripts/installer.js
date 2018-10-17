const { promisify } = require('util');
const { join } = require('path');
const exec = promisify(require('child_process').exec);
const { readFile, writeFile, move, remove, copy, chmod } = require('fs-extra');
const { render } = require('mustache');

const { version } = require('../package.json');
const is_windows = process.platform === 'win32';
const fileicon = join(__dirname, '../node_modules/.bin/fileicon');
const icons = {
  mac: join(__dirname, '../installer/vba-blocks-icon.icns'),
  windows: join(__dirname, '../installer/vba-blocks-icon.ico')
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
    await dmg();
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
  const app = join(__dirname, '../dist/vba-blocks.app');
  await remove(app);
  await exec(`osacompile -o "${app}" "${script}"`);

  // Copy add-ins, bin, etc. to .app
  await copy(join(__dirname, '../dist/unpacked'), app);

  // Set icon on .app
  await exec(`"${fileicon}" set "${app}" "${icons.mac}"`);
}

async function dmg() {
  const appdmg = require('appdmg');

  const title = `vba-blocks ${version} Installer`;
  const dmg = join(__dirname, `../dist/${title}.dmg`);
  const width = 600;
  const height = 500;
  const icon_size = 100;

  const specification = {
    title,
    window: {
      size: {
        width,
        height
      }
    },
    'icon-size': icon_size,
    contents: [
      { x: 200, y: 250, type: 'file', path: 'vba-blocks.app' },
      { x: 400, y: 250, type: 'link', path: '/Applications' }
    ]
  };

  await remove(dmg);

  await new Promise((resolve, reject) => {
    const processing = appdmg({
      basepath: join(__dirname, '../dist'),
      target: dmg,
      specification
    });

    processing.on('progress', info => {
      if (info.type === 'step-begin') {
        console.log(`DMG: ${info.title}`);
      }
    });

    processing.on('finish', resolve);
    processing.on('error', reject);
  });

  // Copy icon into dmg
  await exec(`"${fileicon}" set "${dmg}" "${icons.mac}"`);
}
