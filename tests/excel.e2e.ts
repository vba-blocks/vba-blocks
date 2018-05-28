import { join } from 'path';
import { copy } from 'fs-extra';
import { run, setup, execute, readdir } from '@vba-blocks/helpers/execute';
import { standard, empty } from '@vba-blocks/fixtures';

jest.setTimeout(10000);

test('build', async () => {
  await setup(standard, 'build', async cwd => {
    await execute(cwd, 'build');

    // const result = await validateBuild(cwd);
    const result = await validateBuild(cwd);
    expect(result).toMatchSnapshot();
  });
});

test.skip('export', async () => {
  await setup(empty, 'export-empty', async cwd => {
    await setup(standard, 'export-standard', async built => {
      // 1. Build standard project
      await execute(built, 'build');

      // 2. Copy standard built into empty
      await copy(
        join(built, 'build/e2e-standard.xlsm'),
        join(cwd, 'build/e2e-empty.xlsm')
      );

      // 3. Export "empty" project
      await execute(cwd, 'export xlsm');

      const result = await readdir(cwd);
      expect(result).toMatchSnapshot();
    });
  });
});

interface Result {}

async function validateBuild(cwd): Promise<Result> {
  return { TODO: true };
}
