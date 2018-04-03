const { resolve } = require('path');
const execute = require('./helpers/execute');

test('build', async () => {
  const dir = resolve(__dirname, `./fixtures/standard`);
  const result = await execute(dir, 'build');

  expect(result).toMatchSnapshot();
});
