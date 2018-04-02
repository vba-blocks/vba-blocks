const { resolve } = require('path');
const execute = require('./execute');

test('build', async () => {
  const result = await execute(resolve(__dirname, './build'), 'build');
  expect(result).toMatchSnapshot();
});
