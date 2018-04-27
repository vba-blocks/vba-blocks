const dedent = require('dedent');
const { add } = require('../lib/actions/target');

const help = dedent`
  Work with targets for project.

  Usage: vba-blocks target <command> [options]

  Commands:
    add <type>    Add a target of the given type to the project

  Options:
    --name=NAME   Use the given name for the target [default: project name]
    --path=PATH   Save the target at the given path [default: target/<type>]`;

module.exports = async args => {
  if (args.help) {
    console.log(help);
    return;
  }

  // TODO determine command from args
};
