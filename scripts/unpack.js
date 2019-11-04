const { resolve, dirname, basename, extname, join } = require('path');
const mri = require('mri');
const { ensureDir, pathExists } = require('fs-extra');
const decompress = require('decompress');

main().catch(error => {
  console.error(error);
  process.exit(1);
});

// Usage: node scripts/unpack block [dest]
async function main() {
  const {
    _: [input, output]
  } = mri(process.argv.slice(2));

  const block = resolve(input);
  const dest = output ? resolve(output) : join(dirname(block), basename(block, extname(block)));

  if (!(await pathExists(block))) {
    throw new Error(`Input block "${input}" not found`);
  }

  ensureDir(dest);
  await decompress(block, dest);
}
