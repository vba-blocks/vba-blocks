const { join, extname } = require('path');
const { copy } = require('fs-extra');
const is_windows = process.platform === 'win32';

main().catch(err => {
  console.error(err);
  process.exit(1);
});

async function main() {
  const root = join(__dirname, '../');
  const unpacked = join(root, 'dist/unpacked');

  await copy(join(root, 'run-scripts'), join(unpacked, 'run-scripts'), {
    filter(src) {
      return is_windows ? extname(src) !== '.applescript' : extname(src) !== '.vbs';
    }
  });

  await copy(join(root, 'addins/build'), join(unpacked, 'addins/build'), {
    filter(src) {
      return !src.includes('.backup');
    }
  });

  const dir = join(root, 'scripts/bin');
  await copy(dir, join(unpacked, 'bin'), {
    filter(src) {
      if (src === dir) return true;
      return is_windows ? extname(src) !== '' : extname(src) !== '.cmd';
    }
  });

  await copy(join(root, 'lib'), join(unpacked, 'lib'));
}
