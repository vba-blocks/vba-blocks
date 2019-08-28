import { complex, dev, empty } from '../../../tests/__fixtures__';
import { reset, setup } from '../../../tests/__helpers__/project';
import loadFromProject from '../load-from-project';
import { normalizeBuildGraph } from '../__helpers__/build-graph';

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

test('should load BuildGraph with devDependencies', async () => {
  const { project, dependencies } = await setup(dev);
  const graph = await loadFromProject(project, dependencies);

  expect(normalizeBuildGraph(graph)).toMatchSnapshot();
});

test('should ignore BuildGraph for --release', async () => {
  const { project, dependencies } = await setup(dev);
  const graph = await loadFromProject(project, dependencies, { release: true });

  expect(normalizeBuildGraph(graph)).toMatchSnapshot();
});
