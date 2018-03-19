const { default: init } = require('../lib/actions/init');

const help = `
Initialize a vba-blocks project or package in the current directory

Usage: vba-blocks init [options]

Options:
  --name=NAME     Set the project/package name [default: directory name]
  --target=TYPE   Add target of type TYPE to project
  --package       Create as package`;

module.exports = async args => {
  if (args.help) {
    console.log(help);
    return;
  }

  await init(args);
};
