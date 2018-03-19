const { default: importProject } = require('../lib/actions/import-project');

const help = `
Import src to built targets.

Rebuild VBA project (src and dependencies) of existing built target.
To completely rebuild project (including changes in target), use "vba-blocks build".

Usage: vba-blocks import [options]

Options:
  --target=TYPE   Import only the given target`;

module.exports = async args => {
  if (args.help) {
    console.log(help);
    return;
  }

  await importProject(args);
};
