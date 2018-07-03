import { Args } from 'mri';
import dedent from 'dedent';
import add from '../actions/add-target';
import { TargetType } from '../manifest/target';

const help = dedent`
  Add a new target to project.

  Usage: vba-blocks add-target <type> [options]

  Options:
    <type>        Target type to add (e.g. xlsm)
    --from=FILE   Create target from given document/workbook
    --name=NAME   Use the given name for the target [default: project name]
    --path=PATH   Save the target at the given path [default: target/<type>]`;

module.exports = async (args: Args) => {
  if (args.help) {
    console.log(help);
    return;
  }

  const [_, type] = args._;
  const from = <string | undefined>args.from;
  const name = <string | undefined>args.name;
  const path = <string | undefined>args.path;

  await add({ type: <TargetType>type, from, name, path });
};
