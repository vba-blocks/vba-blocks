import { complex, standardChangesExport } from '../../../tests/__fixtures__';
import { reset, setup } from '../../../tests/__helpers__/project';
import { normalizeManifest } from '../../__helpers__/manifest';
import applyChangeset from '../apply-changeset';
import compareBuildGraphs from '../compare-build-graphs';
import loadFromExport from '../load-from-export';
import loadFromProject from '../load-from-project';

afterEach(reset);

test('should apply changeset for project', async () => {
  jest.spyOn(console, 'log').mockImplementation(() => {});

  const { project, dependencies } = await setup(complex, { silent: false });
  const before = await loadFromProject(project, dependencies);
  const after = await loadFromExport(standardChangesExport);
  const changeset = compareBuildGraphs(before, after);

  await applyChangeset(project, changeset);

  expect(normalizeManifest(project.manifest)).toMatchSnapshot();
});
