import { Args } from 'mri';
import dedent from 'dedent';
import {
  setup,
  installExcel,
  addToPATH,
  uninstallExcel,
  removeFromPATH
} from '../actions/setup';

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

  const install = <string | boolean | undefined>args.install;
  const uninstall = <string | boolean | undefined>args.uninstall;
  const add_to_path = <boolean | undefined>args.path;
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

  if (!operations.length) {
    console.log('No setup operations found.\n');
    console.log(help);
    return;
  }

  await setup(operations);
};
