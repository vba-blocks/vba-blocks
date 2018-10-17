const { promisify } = require('util');
const { join } = require('path');
const rcedit = promisify(require('rcedit'));
const { version } = require('../package.json');

main().catch(err => {
  console.error(err);
  process.exit(1);
});

async function main() {
  const exe = join(__dirname, '../dist/unpacked/bin/vba-blocks.exe');
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
    icon: join(__dirname, '../installer/vba-blocks-icon.ico')
  });
}
