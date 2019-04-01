import mri, { Args } from 'mri';
import * as colors from 'ansi-colors';
import meant from 'meant';
import dedent from 'dedent/macro';
import has from '../utils/has';
import { joinCommas } from '../utils/text';
import { RunError } from '../utils/run';
import { __default } from '../utils/interop';
import { CliError, ErrorCode, cleanError } from '../errors';
import { updateAvailable, updateVersion, checkForUpdate } from '../installer';
import { version } from '../../package.json';
// Can't import debug here to allow --debug flag handling

import { Message } from '../messages';

Error.stackTraceLimit = Infinity;

type Command = (args: Args) => Promise<void>;
const commands: { [name: string]: () => Promise<Command> } = {
  new: async () => (await import('./vba-blocks-new')).default,
  init: async () => (await import('./vba-blocks-init')).default,
  build: async () => (await import('./vba-blocks-build')).default,
  export: async () => (await import('./vba-blocks-export')).default,
  run: async () => (await import('./vba-blocks-run')).default
};

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

  const filters = (<string>debug).split(',').map(filter => `vba-blocks:${filter}`);
  const existing = process.env.DEBUG ? process.env.DEBUG.split(',') : [];

  process.env.DEBUG = existing.concat(filters).join(',');
}

const help = dedent`
  vba-blocks v${version}

  Usage: vba-blocks [command] [options]

  Commands:
    - new           Create a new project / package in a new directory
    - init          Initialize a new project / package in the current directory
    - build         Build project from manifest
    - export        Export src from built target
    - run           Run macro in document / add-in
    - help          Outputs this message or the help of the given command

  Options:
    -h, --help      Output usage information
    -v, --version   Output the version number

  Use 'vba-blocks help COMMAND' for help on specific commands.
  Visit https://vba-blocks.com to learn more about vba-blocks.`;

const updateAvailableMessage = () => dedent`
  \n${colors.greenBright('New Update!')} ${updateVersion()!}

  A new version of vba-blocks is available.
  Visit https://vba-blocks.com/update for more information.`;

process.title = 'vba-blocks';
process.on('unhandledRejection', handleError);
process.on('uncaughtException', handleError);

main()
  .then(() => process.exit(0))
  .catch(handleError);

async function main() {
  const env = (await import('../env')).default;
  const debug = env.debug('vba-blocks:main');

  let [command] = args._;

  if (!command) {
    if (args.version) console.log(version);
    else {
      console.log(help);

      if (updateAvailable()) {
        env.reporter.log(Message.UpdateAvailable, updateAvailableMessage());
      }
    }

    return;
  }

  if (command === 'help') {
    command = args._[1];

    if (!command) {
      console.log(help);
      return;
    }

    args._ = [command];
    args.help = true;
  }
  command = command.toLowerCase();

  const available = Object.keys(commands);
  if (!available.includes(command)) {
    const approximate = meant(command, available);
    const did_you_mean = approximate.length
      ? `, did you mean "${meant(command, available)}"?`
      : '.';
    const list = joinCommas(available.map(name => `"${name}"`));

    return new CliError(
      ErrorCode.UnknownCommand,
      dedent`
        Unknown command "${command}"${did_you_mean}

        Available commands are ${list}.
        Try "vba-blocks help" for more information.
      `
    );
  }

  // Remove command from args
  args._ = args._.slice(1);

  let subcommand: (args: Args) => Promise<void>;
  try {
    debug(`loading "./vba-blocks-${command}.js"`);
    subcommand = await commands[command]();
  } catch (err) {
    throw new Error(`Failed to load command "${command}".\n${err.stack}`);
  }

  debug(`starting "${command}" with args ${JSON.stringify(args)}`);
  const [has_update_available] = await Promise.all([checkForUpdate(), subcommand(args)]);

  if (has_update_available) {
    env.reporter.log(Message.UpdateAvailable, updateAvailableMessage());
  }
}

function isCliError(error: Error | CliError): error is CliError {
  return has(error, 'underlying');
}

function isRunError(error: Error | RunError): error is RunError {
  return has(error, 'result');
}

export function handleError(err: Error | CliError) {
  const { message } = cleanError(err);

  console.error(`${colors.redBright('ERROR')} ${message}`);

  // TODO
  // if (err.code) {
  //   console.log(
  //     chalk`\n{dim Visit https://vba-blocks.com/errors/${
  //       err.code
  //     } for more information}`
  //   );
  // }

  // Couldn't import debug, so log directly if debugging anything
  if (process.env.DEBUG) {
    console.error(err);

    if (isCliError(err) && err.underlying) {
      console.error('underlying', err.underlying);
    }
    if (isRunError(err)) {
      console.error('result', err.result);
    }
  }

  process.exit(1);
}
