const { default: exportProject } = require('../lib/actions/export-project');

const help = `
Export src from built targets.

Export src from built targets.

Usage: vba-blocks export <target>`;

module.exports = async args => {
  if (args.help) {
    console.log(help);
    return;
  }

  await exportProject(args);
};
