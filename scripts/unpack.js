const decompress = require('decompress');
const mri = require('mri');
const { fs, path } = require('../lib/utils');

const { ensureDir, pathExists } = fs;
const { basename, dirname, extname, join, resolve } = path;

const usage = `
Unpack block at given path

Usage: node scripts/unpack <input> [<output>]

Options:
  <input>     Path to input block
  [<output>]  Path to output directory (default is input name)
`;

main().catch(error => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const {
    _: [input, output],
    help
  } = mri(process.argv.slice(2), { alias: { h: 'help' } });

  if (help) {
    console.log(usage);
    return;
  }

  const block = resolve(input);
  const dest = output ? resolve(output) : removeExtension(block);

  if (!(await pathExists(block))) {
    throw new Error(`Input block "${input}" not found`);
  }

  ensureDir(dest);
  await decompress(block, dest);
}

function removeExtension(path) {
  const dir = dirname(path);
  const base = basename(path, extname(path));

  return join(dir, base);
}
