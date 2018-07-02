import { Args } from 'mri';
import dedent from 'dedent';
import { add } from '../actions/target';
import { TargetType } from '../manifest/target';

const help = dedent`
  Work with targets for project.

  Usage: vba-blocks target <command> [options]

  Commands:
    add <type>    Add a target of the given type to the project

  Options:
    --from=FILE   Create target from given document/workbook
    --name=NAME   Use the given name for the target [default: project name]
    --path=PATH   Save the target at the given path [default: target/<type>]`;

module.exports = async (args: Args) => {
  if (args.help) {
    console.log(help);
    return;
  }

  const [_, command, type] = args._;
  const from = <string | undefined>args.from;
  const name = <string | undefined>args.name;
  const path = <string | undefined>args.path;

  if (command === 'add') {
    await add({ type: <TargetType>type, from, name, path });
  } else {
    // TODO unknown command
  }
};
