const { promisify } = require('util');
const { join } = require('path');
const { pathExists } = require('fs-extra');
const rcedit = promisify(require('rcedit'));
const dedent = require('dedent');
const { version } = require('../package.json');

main().catch(err => {
  console.error(err);
  process.exit(1);
});

async function main() {
  // Issue changing icon on output of pkg
  // -> change on cached pkg binary
  const exe = join(__dirname, '../vendor/pkg/v2.5/fetched-v10.4.1-win-x86');
  if (!(await pathExists(exe))) {
    console.log(
      dedent`
        WARNING Unable to set file information for vba-blocks.exe.
        Run 'yarn build:pkg:win' or 'yarn build:win' again to apply changes.
        (If you see this message multiple times, scripts/rcedit.js may need to be updated)
      `
    );

    return;
  }

  await rcedit(exe, {
    'version-string': {
      ProductName: 'vba-blocks',
      FileDescription: 'vba-blocks CLI',
      CompanyName: 'vba-blocks',
      LegalCopyright: `Copyright ${new Date().getFullYear()}, Tim Hall`,
      OriginalFilename: 'vba-blocks.exe'
    },
    'file-version': version,
    'product-version': version,
    icon: join(__dirname, '../installer/icons/vba-blocks.ico')
  });
}
