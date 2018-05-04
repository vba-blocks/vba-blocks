import { Args } from 'mri';
import dedent from 'dedent';
import build from '../actions/build';

const help = dedent`
  Build project from manifest.

  Creates a clean build of the project (after backing up any existing built targets).
  If the project has already been built, "vba-blocks import" can be used to rebuild just the VBA project.

  Usage: vba-blocks build [options]

  Options:
    --target=TYPE   Build the given target`;

module.exports = async (args: Args) => {
  if (args.help) {
    console.log(help);
    return;
  }

  const addin = <string | undefined>args.addin;
  await build({ addin });
};
