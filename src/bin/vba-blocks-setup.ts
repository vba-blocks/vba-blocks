import { Args } from 'mri';
import dedent from 'dedent';
import setup from '../actions/setup';

const help = dedent`
  TODO`;

module.exports = async (_args: Args) => {
  if (_args.help) {
    console.log(help);
    return;
  }

  await setup();
};
