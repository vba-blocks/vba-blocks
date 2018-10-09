const { join } = require('path');
const { createWriteStream } = require('fs');
const { create: createArchive } = require('archiver');
const { version } = require('../package.json');

main().catch(err => {
  console.error(err);
  process.exit(1);
});

async function main() {
  const dist = join(__dirname, '../dist');
  const unpacked = join(dist, 'unpacked');
  const platform = process.platform === 'win32' ? 'win-x86' : 'mac';
  const file = join(dist, `vba-blocks-v${version}-${platform}.zip`);

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
