process.env.DEBUG = 'vba-blocks:*';

const { buildProject } = require('../lib');
const { path } = require('../lib/utils');

const { join } = path;

main().catch(err => {
  console.error(err.message);
  console.log(err.underlying && err.underlying.result);
  process.exit(1);
});

async function main() {
  const addin = join(__dirname, 'bootstrap/build/bootstrap.xlsm');
  await buildProject({ addin });
}
