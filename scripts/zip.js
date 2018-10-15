const { join } = require('path');
const { createWriteStream } = require('fs');
const { create: createArchive } = require('archiver');
const { version } = require('../package.json');
const is_windows = process.platform === 'win32';

main().catch(err => {
  console.error(err);
  process.exit(1);
});

async function main() {
  if (!is_windows) return;

  const dist = join(__dirname, '../dist');
  const unpacked = join(dist, 'unpacked');
  const file = join(dist, `vba-blocks-v${version}.zip`);

  return new Promise((resolve, reject) => {
    try {
      const output = createWriteStream(file);
      const archive = createArchive('zip');

      output.on('close', () => {
        console.log(`Done - ${file}`);
        resolve();
      });
      output.on('error', reject);

      archive.pipe(output);
      archive.on('error', reject);

      archive.directory(unpacked, '/.vba-blocks');
      archive.finalize();
    } catch (err) {
      reject(err);
    }
  });
}
