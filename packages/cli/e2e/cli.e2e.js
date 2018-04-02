const { resolve } = require('path');
const execute = require('./execute');

const cases = {
  build: { command: 'build' }
};

for (const [name, { command }] of Object.entries(cases)) {
  test(name, async () => {
    const cwd = resolve(__dirname, `./${name}`);
    const result = await execute(cwd, command);

    expect(result).toMatchSnapshot();
  });
}
