import { setup, reset } from '../../../tests/__helpers__/project';
import {
  dir,
  complex,
  standardChangesExport
} from '../../../tests/__fixtures__';
import { relative } from '../../utils/path';
import { writeFile } from '../../utils/fs';
import loadFromProject from '../load-from-project';
import loadFromExport from '../load-from-export';
import compareBuildGraphs from '../compare-build-graphs';
import applyChangeset from '../apply-changeset';

afterEach(reset);

test('should apply changeset for project', async () => {
  const { project, dependencies } = await setup(complex);

  const before = await loadFromProject(project, dependencies);
  const after = await loadFromExport(standardChangesExport);
  const changeset = compareBuildGraphs(before, after);

  jest.spyOn(console, 'log').mockImplementation(() => {});
  await applyChangeset(project, changeset);

  expect(mock(console.log).calls).toMatchSnapshot();
  expect(mock(writeFile).calls.map(normalizeWrite)).toMatchSnapshot();

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

function normalizeWrite(write_call) {
  const [path, data] = write_call;
  return [relative(dir, path), data];
}
