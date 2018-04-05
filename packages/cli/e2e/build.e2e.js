const { resolve } = require('path');
const { tmp, execute, check } = require('./helpers/execute');
const { openExcel, closeExcel } = require('./helpers/addin');

jest.setTimeout(10000);

test('build', async () => {
  const dir = resolve(__dirname, `./fixtures/standard`);
  const { path: cwd, cleanup } = await tmp(dir);

  try {
    await openExcel();
    await execute(cwd, 'build');

    const result = await check(cwd);
    expect(result).toMatchSnapshot();
  } finally {
    await cleanup();
    await closeExcel();
  }
});
