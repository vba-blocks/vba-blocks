const dedent = require('dedent');
const { default: build } = require('../lib/actions/build');

const help = dedent`
  Build project from manifest.

  Creates a clean build of the project (after backing up any existing built targets).
  If the project has already been built, "vba-blocks import" can be used to rebuild just the VBA project.

  Usage: vba-blocks build [options]

  Options:
    --target=TYPE   Build the given target`;

module.exports = async args => {
  if (args.help) {
    console.log(help);
    return;
  }

  await build(args);
};
