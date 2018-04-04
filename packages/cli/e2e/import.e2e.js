const { resolve, join } = require('path');
const { tmp, execute, check } = require('./helpers/execute');
const { default: createTarget } = require('../lib/targets/create-target');

jest.setTimeout(10000);

test('import', async () => {
  const dir = resolve(__dirname, `./fixtures/standard`);
  const { path: cwd, cleanup } = await tmp(dir);

  try {
    const project = {
      paths: { build: join(cwd, 'build') }
    };
    const target = {
      name: 'e2e-build',
      path: join(cwd, 'targets/xlsm'),
      filename: 'e2e-build.xlsm'
    };

    await createTarget(project, target);
    await execute(cwd, 'import');

    const result = await check(cwd);
    expect(result).toMatchSnapshot();
  } finally {
    await cleanup();
  }
});
