import { setup, reset } from '../../../tests/__helpers__/project';
import { dir, standard, empty } from '../../../tests/__fixtures__';
import { relative } from '../../utils/path';
import { BuildGraph } from '../build-graph';
import { Component } from '../component';

import loadFromProject from '../load-from-project';

afterAll(reset);

test('should load BuildGraph from standard project', async () => {
  const { project, dependencies } = await setup(standard);
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
    components: components.map(normalizeComponent),
    references
  };
}

export function truncate(value: string): string {
  return value.length > 200 ? `${value.slice(0, 200)}...` : value;
}

export function normalizeComponent(component: Component): Component {
  return {
    type: component.type,
    name: component.name,
    code: truncate(component.code),
    details: {
      path: component.details.path && relative(dir, component.details.path),
      dependency: component.details.dependency
    },
    binary_path: component.binary_path,
    filename: component.filename
  };
}
