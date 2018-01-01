const mri = require('mri');
const chalk = require('chalk');
const { version } = require('../package.json');

const help = chalk`
vba-blocks v${version}

Usage: vba-blocks [command] [options]

Options:
  -h, --help      Output usage information
  -v, --version   Output the version number

Commands
  - build         Build project from manifest
  
Use \`{white.bold vba-blocks COMMAND --help}\` for help on specific commands.
Visit {white.bold https://vba-blocks.com} to learn more about vba-blocks.`;

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err.message);
    process.exit(1);
  });

async function main() {
  const args = mri(process.argv.slice(2), {
    alias: {
      v: 'version',
      h: 'help'
    }
  });
  const [command] = args._;

  if (!command) {
    if (args.version) console.log(version);
    else console.log(help);
    return;
  }

  let subcommand;
  try {
    subcommand = require(`./vba-blocks-${command}`);
  } catch (err) {
    throw new Error(
      `${chalk.redBright('ERROR')} Unknown command "${
        command
      }". Try "vba-blocks --help" for a list of commands.`
    );
  }

  await subcommand(args);
}
