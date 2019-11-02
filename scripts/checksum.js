const { resolve } = require('path');
const checksum = require('./lib/checksum');

main().catch(err => {
  console.error(err);
  process.exit(1);
});

async function main() {
  const path = process.argv[2];
  if (!path) return;

  const full_path = resolve(path);
  console.log(await checksum(full_path));
}
