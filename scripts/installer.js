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
  const script = join(
    __dirname,
    '../dist/vba-blocks.app/Contents/MacOS/vba-blocks'
  );
  await copy(
    join(__dirname, '../dist/unpacked'),
    join(__dirname, '../dist/vba-blocks.app')
  );
  await copy(join(__dirname, '../installer/vba-blocks'), script);
  await chmod(script, '555');

  const install_script = join(
    __dirname,
    '../installer/Install vba-blocks.applescript'
  );
  const dest = join(__dirname, '../dist/Install vba-blocks.app');

  await exec(`osacompile -o '${dest}' '${install_script}'`);
}

async function dmg() {
  const appdmg = require('appdmg');

  const title = `vba-blocks ${version} Installer`;
  const target = join(__dirname, `../dist/${title}.dmg`);
  const specification = {
    title,
    contents: [
      {
        x: 192,
        y: 344,
        type: 'file',
        path: 'vba-blocks.app'
      },
      { x: 292, y: 344, type: 'file', path: 'Install vba-blocks.app' },
      {
        x: 0,
        y: 0,
        type: 'file',
        path: join(__dirname, '../installer/Install vba-blocks.applescript'),
        name: 'Install vba-blocks.applescript'
      }
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
