const { join } = require('path');
const { copy } = require('fs-extra');

main().catch(err => {
  console.error(err);
  process.exit(1);
});

async function main() {
  await copy(
    join(__dirname, '../node_modules/dugite/git'),
    join(__dirname, '../dist/git')
  );
}
