const { resolve, join } = require('path');
const { tmp, execute, check } = require('./helpers/execute');
const { openExcel, closeExcel } = require('./helpers/addin');
const { copyFile } = require('../lib/utils/fs');
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
      name: 'e2e-standard',
      path: join(cwd, 'targets/xlsm'),
      filename: 'e2e-standard.xlsm'
    };

    await createTarget(project, target);
    await execute(cwd, 'import');

    const result = await check(cwd);
    expect(result).toMatchSnapshot();
  } finally {
    await cleanup();
  }
});

test('export', async () => {
  const empty = resolve(__dirname, './fixtures/empty');
  const std = resolve(__dirname, './fixtures/standard');

  const [
    { path: cwdEmpty, cleanup: cleanupEmpty },
    { path: cwdStd, cleanup: cleanupStd }
  ] = await Promise.all([tmp(empty), tmp(std)]);

  try {
    // First, build projects
    await execute(cwdEmpty, 'build');
    await execute(cwdStd, 'build');

    // Move standard to empty (new things to export)
    // TODO only checks add, need to check change and remove
    await copyFile(
      join(cwdStd, 'build/e2e-standard.xlsm'),
      join(cwdEmpty, 'build/e2e-empty.xlsm')
    );

    await execute(cwdEmpty, 'export xlsm');

    const result = await check(cwdEmpty);
    expect(result).toMatchSnapshot();
  } finally {
    await Promise.all([cleanupEmpty(), cleanupStd()]);
  }
});
