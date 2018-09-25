import { Args } from 'mri';
import dedent from 'dedent';
import create from '../actions/create';

const help = dedent`
  Create new project or package with the given name in a new directory

  Usage: vba-blocks new <name> [options]

  Options:
    --target=TYPE   Add target of type TYPE to project (e.g. xlsm)
    --from=PATH     Create target and src from workbook/document
    --package       Create as package
    --no-git        Skip initializing git reposistory`;

module.exports = async (args: Args) => {
  if (args.help) {
    console.log(help);
    return;
  }

  const [name] = args._;
  const target = <string | undefined>args.target;
  const from = <string | undefined>args.from;
  const pkg = !!args.package;
  const git = 'git' in args ? <boolean>args.git : true;

  await create({ name, target, from, pkg, git });
};
