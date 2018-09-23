import { Args } from 'mri';
import dedent from 'dedent';
import exportProject from '../actions/export-project';

const help = dedent`
  Export src from built target.

  Usage: vba-blocks export
  
  Options:
    --target=TYPE   Export target of type TYPE [default = target]`;

module.exports = async (args: Args) => {
  if (args.help) {
    console.log(help);
    return;
  }

  const [_, target] = args._;
  const completed = <string | undefined>args.completed;
  const addin = <string | undefined>args.addin;

  await exportProject({ target, completed, addin });
};
