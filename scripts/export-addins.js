const { exportProject } = require('../lib');
const { path } = require('../lib/utils');

const { join } = path;

main().catch(err => {
  console.error(err);
  process.exit(1);
});

async function main() {
  await exportProject({
    addin: join(__dirname, 'bootstrap/build/bootstrap.xlsm')
  });
}
