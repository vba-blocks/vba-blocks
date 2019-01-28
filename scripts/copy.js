const { join } = require('path');
const { copy } = require('fs-extra');
const is_windows = process.platform === 'win32';

main().catch(err => {
  console.error(err);
  process.exit(1);
});

async function main() {
  await copy(join(__dirname, '../run-scripts'), join(__dirname, '../dist/unpacked/run-scripts'), {
    filter(src) {
      return is_windows ? !src.endsWith('.applescript') : !src.endsWith('.vbs');
    }
  });

  await copy(join(__dirname, '../addins/build'), join(__dirname, '../dist/unpacked/addins'), {
    filter(src) {
      return !src.includes('.backup');
    }
  });
}
