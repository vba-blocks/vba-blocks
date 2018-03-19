const { default: exportProject } = require('../lib/actions/export-project');

const help = `
Export src from built targets.

Export VBA and target sources from built target.

Usage: vba-blocks export [options]

Options:
  --target=TYPE   Export only the given target`;

module.exports = async args => {
  if (args.help) {
    console.log(help);
    return;
  }

  await exportProject(args);
};
