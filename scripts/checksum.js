const { resolve } = require('path');
const { createHash } = require('crypto');
const { readFile } = require('fs-extra');

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

async function checksum(file, algorithm = 'sha256') {
  const data = await readFile(file);
  return hash(data, { algorithm });
}

function hash(data, options) {
  const { algorithm = 'sha256', encoding = 'utf8', digest = 'hex' } = options;

  return createHash(algorithm)
    .update(Buffer.isBuffer(data) ? data.toString('utf-8') : data, encoding)
    .digest(digest);
}
