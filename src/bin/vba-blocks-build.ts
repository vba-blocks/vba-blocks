import { Args } from 'mri';
import dedent from 'dedent';
import build from '../actions/build';

const help = dedent`
  Build project from manifest.

  Create a clean build of the project (after backing up any existing built targets).

  Usage: vba-blocks build [options]`;

// TODO add --targets xlsm,xlam option

module.exports = async (args: Args) => {
  if (args.help) {
    console.log(help);
    return;
  }

  const addin = <string | undefined>args.addin;
  await build({ addin });
};
