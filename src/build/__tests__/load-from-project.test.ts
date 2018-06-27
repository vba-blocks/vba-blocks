import { setup, reset } from '../../../tests/__helpers__/project';
import { dir, complex, empty } from '../../../tests/__fixtures__';
import { BuildGraph } from '../build-graph';
import { normalizeComponent } from '../component';

import loadFromProject from '../load-from-project';

afterAll(reset);

test('should load BuildGraph from standard project', async () => {
  const { project, dependencies } = await setup(complex);
  const graph = await loadFromProject(project, dependencies);

  expect(normalizeBuildGraph(graph)).toMatchSnapshot();
});

test('should load BuildGraph from empty project', async () => {
  const { project, dependencies } = await setup(empty);
  const graph = await loadFromProject(project, dependencies);

  expect(normalizeBuildGraph(graph)).toMatchSnapshot();
});

export function normalizeBuildGraph(graph: BuildGraph) {
  const { name, components, references } = graph;

  return {
    name,
    components: components.map(component => normalizeComponent(component, dir)),
    references
  };
}
