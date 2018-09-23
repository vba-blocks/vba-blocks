import { join } from 'path';
import { copy } from 'fs-extra';
import {
  tmp,
  run,
  RunResult,
  setup,
  execute,
  readdir
} from './__helpers__/execute';
import { standard, empty, json, single, targetless } from './__fixtures__';

jest.setTimeout(30000);

describe('build', () => {
  test('build standard project', async () => {
    await setup(standard, 'build', async cwd => {
      await execute(cwd, 'build');

      const result = await validateBuild(cwd, 'standard.xlsm');
      expect(result).toMatchSnapshot();
    });
  });

  test('build project with single target', async () => {
    await setup(single, 'build-single', async cwd => {
      await execute(cwd, 'build');

      const result = await validateBuild(cwd, 'single.xlsm');
      expect(result).toMatchSnapshot();
    });
  });

  test('build project with no target', async () => {
    await setup(targetless, 'build-targetless', async cwd => {
      await execute(cwd, 'build --target xlsm');

      const result = await validateBuild(cwd, 'targetless.xlsm');
      expect(result).toMatchSnapshot();
    });
  });
});

describe('export', () => {
  test('export to empty project', async () => {
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

  test('export to project with dependency', async () => {
    await setup(json, 'export-json', async cwd => {
      await setup(standard, 'export-standard-to-json', async built => {
        await execute(built, 'build');

        await copy(
          join(built, 'build/standard.xlsm'),
          join(cwd, 'build/json.xlsm')
        );

        const { stdout } = await execute(cwd, 'export xlsm');

        const result = await readdir(cwd);
        expect(result).toMatchSnapshot();
        expect(stdout).toMatchSnapshot();
      });
    });
  });
});

describe('new', () => {
  test('should create blank project', async () => {
    await tmp('new-blank-project', async cwd => {
      await execute(cwd, 'new blank-project');

      const result = await readdir(join(cwd, 'blank-project'));
      expect(result).toMatchSnapshot();
    });

    await tmp('new-blank-package', async cwd => {
      await execute(cwd, 'new blank-package --package --no-git');

      const result = await readdir(join(cwd, 'blank-package'));
      expect(result).toMatchSnapshot();
    });
  });

  test('should create with blank target', async () => {
    await tmp('new-blank-target', async cwd => {
      await execute(cwd, 'new blank-target --target xlsm');

      const result = await readdir(join(cwd, 'blank-target'));
      expect(result).toMatchSnapshot();
    });
  });

  test('should create from existing', async () => {
    await tmp('new-existing-target', async cwd => {
      await setup(standard, 'new-existing-target-build', async built => {
        await execute(built, 'build');
        await execute(
          cwd,
          `new existing-target --from ${join(built, 'build/standard.xlsm')}`
        );

        const result = await readdir(join(cwd, 'existing-target'));
        expect(result).toMatchSnapshot();
      });
    });
  });
});

describe('add-target', () => {
  test('should add blank target', async () => {
    await tmp('add-blank-target', async cwd => {
      await execute(cwd, `new add-blank`);
      const { stdout } = await execute(
        join(cwd, 'add-blank'),
        'add-target xlsm --name target-name'
      );

      const result = await readdir(join(cwd, 'add-blank'));
      expect(result).toMatchSnapshot();
      expect(stdout).toMatchSnapshot();
    });
  });

  test('should add from existing', async () => {
    await tmp('add-existing-target', async cwd => {
      await setup(standard, 'add-existing-target-build', async built => {
        await execute(built, 'build');
        await execute(cwd, `new add-existing`);
        const { stdout } = await execute(
          join(cwd, 'add-existing'),
          `add-target xlsm --from ${join(built, 'build/standard.xlsm')}`
        );

        const result = await readdir(join(cwd, 'add-existing'));
        expect(result).toMatchSnapshot();
        expect(stdout).toMatchSnapshot();
      });
    });
  });
});

async function validateBuild(cwd: string, target: string): Promise<RunResult> {
  const file = join(cwd, 'build', target);
  return await run('excel', file, 'Validation.Validate');
}
