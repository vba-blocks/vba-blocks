import { Args } from 'mri';
import dedent from 'dedent';
import exportProject from '../actions/export-project';

const help = dedent`
  Export src from built target.

  Usage: vba-blocks export <target>`;

module.exports = async (args: Args) => {
  if (args.help) {
    console.log(help);
    return;
  }

  await exportProject(args);
};
