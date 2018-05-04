import mri from 'mri';
import chalk from 'chalk';
import dedent from 'dedent';
import { has } from '../utils';
import { CliErrorCode, CliError, unknownCommand, cleanError } from '../errors';
const version = 'VERSION';

const commands = ['build', 'export', 'healthcheck'];
const args = mri(process.argv.slice(2), {
  alias: {
    v: 'version',
    h: 'help'
  }
});

if (args.debug) {
  let debug = args.debug;
  if (debug === true) debug = '*';
  else if (Array.isArray(debug)) debug = debug.join(',');

  const filters = (<string>debug)
    .split(',')
    .map(filter => `vba-blocks:${filter}`);
  const existing = process.env.DEBUG ? process.env.DEBUG.split(',') : [];

  process.env.DEBUG = existing.concat(filters).join(',');
}
const debug = require('debug')('vba-blocks:main');

const help = dedent`
  vba-blocks v${version}

  Usage: vba-blocks [command] [options]

  Commands
    - build         Build project from manifest
    - export        Export src from built target

  Options:
    -h, --help      Output usage information
    -v, --version   Output the version number

  Use "vba-blocks COMMAND --help" for help on specific commands.
  Visit https://vba-blocks.com to learn more about vba-blocks.`;

process.title = 'vba-blocks';
process.on('unhandledRejection', handleError);

main()
  .then(() => process.exit(0))
  .catch(handleError);

async function main() {
  const [command] = args._;

  if (!command) {
    if (args.version) console.log(version);
    else console.log(help);
    return;
  }

  if (!commands.includes(command)) {
    throw unknownCommand(command);
  }

  let subcommand;
  try {
    subcommand = require(`./vba-blocks-${command}.js`);
  } catch (err) {
    throw new Error(`Failed to load command "${command}".\n${err.stack}`);
  }

  debug(`starting "${command}" with args ${JSON.stringify(args)}`);
  await subcommand(args);
}

function isCliError(error: Error | CliError): error is CliError {
  return has(error, 'underlying');
}

function handleError(err: Error | CliError) {
  const { message, stack } = cleanError(err);

  console.error(`${chalk.redBright('ERROR')} ${message}`);

  // TODO
  // if (err.code) {
  //   console.log(
  //     chalk`\n{dim Visit https://vba-blocks.com/errors/${
  //       err.code
  //     } for more information}`
  //   );
  // }

  debug(err);
  if (isCliError(err) && err.underlying) {
    debug(err.underlying);
  }

  process.exit(1);
}
