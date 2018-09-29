import mri from 'mri';
import chalk from 'chalk';
import dedent from 'dedent';
import has from '../utils/has';
import { CliError, unknownCommand, cleanError } from '../errors';
import { RunError } from '../utils/run';

Error.stackTraceLimit = Infinity;
const version = 'VERSION';

const commands = ['new', 'init', 'build', 'export', 'run', 'healthcheck'];
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
    - new           Create a new project / package in a new directory
    - init          Initialize a new project / package in the current directory
    - build         Build project from manifest
    - export        Export src from built target
    - run           Run macro in document / add-in

  Options:
    -h, --help      Output usage information
    -v, --version   Output the version number

  Use "vba-blocks COMMAND --help" for help on specific commands.
  Visit https://vba-blocks.com to learn more about vba-blocks.`;

process.title = 'vba-blocks';
process.on('unhandledRejection', handleError);
process.on('uncaughtException', handleError);

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

  // Remove command from args
  args._ = args._.slice(1);

  let subcommand;
  try {
    debug(`loading "./vba-blocks-${command}.js"`);
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

function isRunError(error: Error | RunError): error is RunError {
  return has(error, 'result');
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
    debug('underlying', err.underlying);
  }
  if (isRunError(err)) {
    debug('result', err.result);
  }

  process.exit(1);
}
