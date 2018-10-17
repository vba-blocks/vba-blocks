const { promisify } = require('util');
const { join } = require('path');
const exec = promisify(require('child_process').exec);
const { readFile, writeFile, move, remove, copy, chmod } = require('fs-extra');
const { render } = require('mustache');

const { version } = require('../package.json');
const is_windows = process.platform === 'win32';

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
  // 1. Create .app from applescript
  const script = join(__dirname, '../installer/vba-blocks.applescript');
  const app = join(__dirname, '../dist/vba-blocks.app');
  await remove(app);
  await exec(`osacompile -o "${app}" "${script}"`);

  // 2. Copy add-ins, bin, etc. to .app
  await copy(
    join(__dirname, '../dist/unpacked'),
    join(__dirname, '../dist/vba-blocks.app')
  );

  // 3. Copy icon into .app
  await copy(
    join(__dirname, '../installer/vba-blocks-icon.icns'),
    join(__dirname, '../dist/vba-blocks.app/Contents/Resources/vba-blocks.icns')
  );
}

async function dmg() {
  const appdmg = require('appdmg');

  const title = `vba-blocks ${version} Installer`;
  const target = join(__dirname, `../dist/${title}.dmg`);
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

  await remove(target);

  await new Promise((resolve, reject) => {
    const processing = appdmg({
      basepath: join(__dirname, '../dist'),
      target,
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
}
