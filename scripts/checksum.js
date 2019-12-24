const mri = require('mri');
const { fs, path } = require('../lib/utils');

const { checksum } = fs;
const { resolve } = path;

const usage = `
Compute checksum for file at path

Usage: node scripts/checksum <path>

Options:
  <path>  Path to file
`;

main().catch(err => {
  console.error(err);
  process.exit(1);
});

async function main() {
  const {
    _: [path],
    help
  } = mri(process.argv.slice(2), { alias: { h: 'help' } });

  if (help || !path) {
    console.log(usage);
    return;
  }

  const full_path = resolve(path);
  const algorithm = 'sha256';
  const result = await checksum(full_path);

  console.log(`${algorithm}-${result}`);
}
