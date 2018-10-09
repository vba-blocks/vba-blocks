import { Args } from 'mri';
import chalk from 'chalk';
import prompts from 'prompts';
import dedent from 'dedent';
import {
  setup,
  installExcel,
  addToPATH,
  uninstallExcel,
  removeFromPATH
} from '../actions/setup';

const version = 'VERSION';

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

module.exports = async (args: Args) => {
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
        ${chalk.bold.white('Welcome to vba-blocks!')}

        This will walkthrough setting up vba-blocks for use.
        For help on how to use vba-blocks, run "vba-blocks help" in the command-line
      `);
    console.log();

    const answers = await prompts([
      {
        type: 'confirm',
        name: 'path',
        message: 'Add to PATH',
        initial: true
      },
      {
        type: 'confirm',
        name: 'excel',
        message: 'Install Excel Add-in',
        initial: true
      }
    ]);
    console.log();

    install = answers.excel ? 'excel' : undefined;
    add_to_path = answers.path || undefined;
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
      ${chalk.greenBright('Ready!')} vba-blocks is ready for usage.

      Try "vba-blocks help" from the command line to get started.

      Press any key to exit`);

    await new Promise(resolve => {
      process.stdin.setRawMode!(true);
      process.stdin.resume();
      process.stdin.on('data', resolve);
    });
  }
};

function without<T>(values: T[], value: T): T[] {
  return values.filter(item => item !== value);
}
