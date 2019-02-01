import dedent from 'dedent/macro';
import create from '../actions/create';
const help = dedent `
  Create a new project / package in a new directory

  Usage: vba-blocks new <name> [options]

  Options:
    <name>          Project/package name (optionally, with extension)
    --target=TYPE   Add target of type TYPE to project (e.g. xlsm)
    --from=PATH     Create target and src from workbook/document
    --package       Create as package
    --no-git        Skip initializing git repository

  Examples:
  vba-blocks new analysis.xlsm
  vba-blocks new analysis --target xlsm
  vba-blocks new calculations --package
  `;
module.exports = async (args) => {
    if (args.help) {
        console.log(help);
        return;
    }
    const [name] = args._;
    const target = args.target;
    const from = args.from;
    const pkg = !!args.package;
    const git = 'git' in args ? args.git : true;
    await create({ name, target, from, pkg, git });
};
