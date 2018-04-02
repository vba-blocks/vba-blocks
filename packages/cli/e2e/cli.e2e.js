const { resolve } = require('path');
const execute = require('./execute');

test('build', async () => {
  const cwd = resolve(__dirname, `./${name}`);
  const result = await execute(cwd, 'build');

  expect(result).toMatchSnapshot();
});
