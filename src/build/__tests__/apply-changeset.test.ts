import { setup, reset } from '../../../tests/__helpers__/project';
import { complex, standardChangesExport } from '../../../tests/__fixtures__';
import loadFromProject from '../load-from-project';
import loadFromExport from '../load-from-export';
import compareBuildGraphs from '../compare-build-graphs';
import applyChangeset from '../apply-changeset';

afterEach(reset);

test('should apply changeset for project', async () => {
  jest.spyOn(console, 'log').mockImplementation(() => {});

  const { project, dependencies } = await setup(complex, { silent: false });
  const before = await loadFromProject(project, dependencies);
  const after = await loadFromExport(standardChangesExport);
  const changeset = compareBuildGraphs(before, after);

  await applyChangeset(project, changeset);

  expect(project.manifest).toMatchSnapshot();
});

interface Mock {
  calls: any[][];
  restore: () => void;
  clear: () => void;
}

function mock(value: any): Mock {
  return {
    get calls() {
      return value.mock.calls;
    },
    restore() {
      return value.mockRestore();
    },
    clear() {
      return value.mockClear();
    }
  };
}
