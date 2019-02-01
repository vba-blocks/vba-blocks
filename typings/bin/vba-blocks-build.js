import dedent from 'dedent/macro';
import time from 'pretty-hrtime';
import build from '../actions/build';
import open from '../utils/open';
const help = dedent `
  Build project from manifest.

  Create a clean build of the project (after backing up any existing built targets).

  Usage: vba-blocks build [options]

  Options:
    --target=TYPE   Build target of type TYPE
    --open          Open built target`;
module.exports = async (args) => {
    if (args.help) {
        console.log(help);
        return;
    }
    const start = process.hrtime();
    const target = args.target;
    const addin = args.addin;
    const path = await build({ target, addin });
    console.log(`Done. ${time(process.hrtime(start))}`);
    if (!!args.open) {
        open(path);
    }
};
