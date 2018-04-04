const dedent = require('dedent');
const { default: exportProject } = require('../lib/actions/export-project');

const help = dedent`
  Export src from built target.

  Usage: vba-blocks export <target>`;

module.exports = async args => {
  if (args.help) {
    console.log(help);
    return;
  }

  await exportProject(args);
};
