const { default: build } = require('../lib/actions/build');

const help = `
Build project from manifest.

Usage: vba-blocks build`;

module.exports = async args => {
  if (args.help) {
    console.log(help);
    return;
  }

  await build();
};
