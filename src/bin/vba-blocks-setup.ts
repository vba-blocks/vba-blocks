import mri from 'mri';
import * as colors from 'ansi-colors';
import prompts from 'prompts';
import dedent from 'dedent';
import {
  setup,
  installExcel,
  addToPATH,
  uninstallExcel,
  removeFromPATH
} from '../actions/setup';
import { CliError, cleanError } from '../errors';
import has from '../utils/has';
import { RunError } from '../utils/run';
import env from '../env';

const debug = require('debug')('vba-blocks:setup');

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

const help = dedent`
  Setup vba-blocks add-ins and CLI

  Usage: vba-blocks setup [options]

  Options:
    --install             Add to PATH and install Excel add-in
    --uninstall           Remove from PATH and uninstall Excel add-in

    --install=APP         Install add-in. Available: "excel"
    --uninstall=APP       Uninstall add-in. Available: "excel"
    --path/--no-path      Add/remove vba-blocks to/from PATH

  Examples:
  vba-blocks setup --install
  vba-blocks setup --uninstall
  vba-blocks setup --install excel
  vba-blocks setup --no-path`;

process.title = 'vba-blocks-setup';
process.on('unhandledRejection', handleError);
process.on('uncaughtException', handleError);

main()
  .then(() => process.exit(0))
  .catch(handleError);

async function main() {
  if (args.help) {
    console.log(help);
    return;
  }
  const interactive = !without(Object.keys(args), '_').length;

  let install, uninstall, add_to_path;
  if (interactive) {
    if (!process.stdout.isTTY) {
      console.log(help);
      return;
    }

    console.log();
    console.log(dedent`
        ${colors.bold.white('Welcome to vba-blocks!')}

        This will walkthrough setting up vba-blocks for use.
        For help on how to use vba-blocks, run "vba-blocks help" in the command-line
      `);
    console.log();

    const answers = await prompts({
      type: 'select',
      name: 'install',
      message: 'Install or Uninstall vba-blocks?',
      choices: [
        { title: 'Install', value: true },
        { title: 'Uninstall', value: false }
      ],
      initial: 0
    });
    console.log();

    install = answers.install;
    uninstall = !answers.install;
  } else {
    install = <string | boolean | undefined>args.install;
    uninstall = <string | boolean | undefined>args.uninstall;
    add_to_path = <boolean | undefined>args.path;
  }

  const operations = [];

  if (install === true) {
    operations.push(addToPATH());
    operations.push(installExcel());
  } else if (uninstall === true) {
    operations.push(uninstallExcel());
    operations.push(removeFromPATH());
  } else {
    if (install === 'excel') {
      operations.push(installExcel());
    }
    if (uninstall === 'excel') {
      operations.push(uninstallExcel());
    }
    if (add_to_path) {
      operations.push(addToPATH());
    }
    if (add_to_path === false) {
      operations.push(removeFromPATH());
    }
  }

  if (!operations.length && !interactive) {
    console.log('No setup operations found.\n');
    console.log(help);
    return;
  }

  await setup(operations);

  if (interactive) {
    console.log(dedent`
      ${colors.greenBright('Ready!')} vba-blocks is ready for usage.

      Try "vba-blocks help" from the command line to get started.

      Press any key to exit`);

    await new Promise(resolve => {
      process.stdin.setRawMode!(true);
      process.stdin.resume();
      process.stdin.on('data', resolve);
    });
  }
}

function without<T>(values: T[], value: T): T[] {
  return values.filter(item => item !== value);
}

// TODO Copied from vba-blocks, extract to util
export function handleError(err: Error | CliError) {
  const { message, stack } = cleanError(err);

  console.error(`${colors.redBright('ERROR')} ${message}`);

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

function isCliError(error: Error | CliError): error is CliError {
  return has(error, 'underlying');
}

function isRunError(error: Error | RunError): error is RunError {
  return has(error, 'result');
}
