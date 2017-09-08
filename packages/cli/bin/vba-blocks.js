const program = require('commander');
const { version } = require('../package.json');
const commands = require('../lib/commands');

for (const command of Object.values(commands)) {
  command(program);
}

program.version(version);
program.parse(process.argv);
