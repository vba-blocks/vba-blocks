import { setup, reset } from '../../../tests/__helpers__/project';
import { dir, complex, standardExport, standardChangesExport } from '../../../tests/__fixtures__';
import { normalizeComponent } from '../component';
import loadFromProject from '../load-from-project';
import loadFromExport from '../load-from-export';
import compareBuildGraphs, { Changeset } from '../compare-build-graphs';

afterAll(reset);

test('should find no changes between build graphs', async () => {
  const { project, dependencies } = await setup(complex);

  const before = await loadFromProject(project, dependencies);
  const after = await loadFromExport(standardExport);

  const changeset = compareBuildGraphs(before, after);

  expect(changeset.components.added.length).toEqual(0);
  expect(changeset.components.changed.length).toEqual(0);
  expect(changeset.components.removed.length).toEqual(0);
});

test('should find added, changed, and removed between build graphs', async () => {
  const { project, dependencies } = await setup(complex);

  const before = await loadFromProject(project, dependencies);
  const after = await loadFromExport(standardChangesExport);

  const changeset = compareBuildGraphs(before, after);
  expect(normalizeChangeset(changeset)).toMatchSnapshot();

  // TODO finds UserForm1 as changed, look into why
});

export function normalizeChangeset(changeset: Changeset): Changeset {
  const { components, references } = changeset;

  const added = components.added.map(component => normalizeComponent(component, dir));
  const changed = components.changed.map(component => normalizeComponent(component, dir));
  const removed = components.removed.map(component => normalizeComponent(component, dir));

  return {
    components: { added, changed, removed },
    references
  };
}
