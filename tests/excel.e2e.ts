import { join } from 'path';
import { copy } from 'fs-extra';
import { run, RunResult, setup, execute, readdir } from './__helpers__/execute';
import { standard, empty } from './__fixtures__';

jest.setTimeout(20000);

test.only('build', async () => {
  await setup(standard, 'build', async cwd => {
    await execute(cwd, 'build');

    const result = await validateBuild(cwd, 'standard.xlsm');
    expect(result).toMatchSnapshot();
  });
});

test('export', async () => {
  await setup(empty, 'export-empty', async cwd => {
    await setup(standard, 'export-standard', async built => {
      // 1. Build standard project
      await execute(built, 'build');

      // 2. Copy standard built into empty
      await copy(
        join(built, 'build/standard.xlsm'),
        join(cwd, 'build/empty.xlsm')
      );

      // 3. Export "empty" project
      const { stdout } = await execute(cwd, 'export xlsm');

      const result = await readdir(cwd);
      expect(result).toMatchSnapshot();
      expect(stdout).toMatchSnapshot();
    });
  });
});

async function validateBuild(cwd: string, target: string): Promise<RunResult> {
  const file = join(cwd, 'build', target);
  return await run('excel', file, 'Validation.Validate');
}
