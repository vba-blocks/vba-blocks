const program = require('commander');
const { version } = require('../package.json');
const commands = require('../lib/commands');
const { loadConfig } = require('../lib/config');
const { last } = require('../lib/utils');

for (const [name, value] of Object.entries(commands)) {
  const { description, options, action } = value;

  const command = program.command(name);
  if (description) command.description(description);
  if (options) {
    for (const option of options) {
      // TODO
    }
  }

  command.action((...args) => {
    const execute = async () => {
      const config = await loadConfig();
      const options = last(args);

      await action(config, options);
    };

    execute().catch(err => {
      console.error(err.stack || err);
      process.exit(1);
    });
  });
}

program.version(version);
program.parse(process.argv);
