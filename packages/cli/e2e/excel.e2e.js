const { resolve, join } = require('path');
const { tmp, execute, check } = require('./helpers/execute');
const { openExcel, closeExcel } = require('./helpers/addin');
const { default: createTarget } = require('../lib/targets/create-target');

jest.setTimeout(10000);

beforeAll(openExcel);
afterAll(closeExcel);

test('build', async () => {
  const dir = resolve(__dirname, `./fixtures/standard`);
  const { path: cwd, cleanup } = await tmp(dir);

  try {
    await execute(cwd, 'build');

    const result = await check(cwd);
    expect(result).toMatchSnapshot();
  } finally {
    await cleanup();
  }
});

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
