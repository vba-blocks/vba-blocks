import { setup, reset } from '../../../tests/__helpers__/project';
import { standard, standardChangesExport } from '../../../tests/__fixtures__';
import { writeFile } from '../../utils/fs';
import loadFromProject from '../load-from-project';
import loadFromExport from '../load-from-export';
import compareBuildGraphs from '../compare-build-graphs';
import applyChangeset from '../apply-changeset';

afterEach(reset);

test('should apply changeset for project', async () => {
  const { project, dependencies } = await setup(standard);

  const before = await loadFromProject(project, dependencies);
  const after = await loadFromExport(standardChangesExport);
  const changeset = compareBuildGraphs(before, after);

  jest.spyOn(console, 'log').mockImplementation(() => {});
  await applyChangeset(project, changeset);

  expect(mock(console.log).calls).toMatchSnapshot();
  expect(mock(writeFile).calls).toMatchSnapshot();

  mock(console.log).restore();
});

interface Mock {
  calls: any[][];
  restore: () => void;
}

function mock(value: any): Mock {
  return {
    get calls() {
      return value.mock.calls;
    },
    restore() {
      return value.mockRestore();
    }
  };
}
