import { Args } from 'mri';
import dedent from 'dedent';
import { unknownCommand } from '../errors';
const debug = require('debug')('vba-blocks:target');

const commands = ['add'];

const help = dedent`
  Commands for working with targets

  Usage: vba-blocks target [command] [options]

  Commands
    - add       Add a new target to the project

  Options:
    -h, --help  Output usage information

  Use "vba-blocks target COMMAND --help" for help on specific commands.
  Visit https://vba-blocks.com to learn more about vba-blocks.`;

module.exports = async (args: Args) => {
  const [command] = args._;

  if (!command) {
    console.log(help);
    return;
  }

  if (!commands.includes(command)) {
    throw unknownCommand(command);
  }

  // Remove "target" from arguments
  args._ = args._.slice(1);

  let subcommand;
  try {
    debug(`loading "./vba-blocks-target-${command}.js"`);
    subcommand = require(`./vba-blocks-target-${command}.js`);
  } catch (err) {
    throw new Error(`Failed to load target command "${command}"`);
  }

  debug(`starting "target.${command}" with args ${JSON.stringify(args)}`);
  await subcommand(args);
};
