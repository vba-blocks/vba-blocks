const { resolve } = require('path');
const { tmp, execute, check } = require('./helpers/execute');

test('build', async () => {
  const dir = resolve(__dirname, `./fixtures/standard`);
  const { path: cwd, cleanup } = await tmp(dir);

  try {
    await execute(cwd, 'build');
    // TODO Just zip target
    // TODO await execute(cwd, 'import');

    const result = await check(cwd);
    expect(result).toMatchSnapshot();
  } finally {
    await cleanup();
  }
});
