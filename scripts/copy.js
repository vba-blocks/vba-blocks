const { join } = require('path');
const { copy } = require('fs-extra');

main().catch(err => {
  console.error(err);
  process.exit(1);
});

async function main() {
  await copy(
    join(resolveModule('dugite'), 'git'),
    join(__dirname, '../dist/git'),
    { overwrite: false }
  );

  await copy(
    join(__dirname, '../run-scripts'),
    join(__dirname, '../dist/run-scripts'),
    { overwrite: true }
  );

  await copy(
    join(__dirname, '../addins/build'),
    join(__dirname, '../dist/addins'),
    {
      overwrite: true,
      filter(src) {
        return !src.includes('.backup');
      }
    }
  );

  await copy(
    join(__dirname, '../native/target/release/vba-blocks-native.exe'),
    join(__dirname, '../dist/native/vba-blocks-native.exe'),
    {
      overwrite: true
    }
  );
}

function resolveModule(name) {
  const [root] = require.resolve(name).split('node_modules', 1);
  return join(root, 'node_modules', name);
}
