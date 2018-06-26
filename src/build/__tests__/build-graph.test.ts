import { setup, reset } from '../../../tests/__helpers__/project';
import { standard } from '../../../tests/__fixtures__';
import { loadBuildGraph, BuildGraph } from '../build-graph';
import { Component } from '../component';

afterEach(reset);

test('should create build graph', async () => {
  const { project, dependencies } = await setup(standard);

  const graph = await loadBuildGraph(project, dependencies);
  expect(normalizeGraph(graph)).toMatchSnapshot();
});

function normalizeGraph(graph: BuildGraph) {
  const { name, components, references } = graph;

  return {
    name,
    components: components.map(toComponent),
    references
  };
}

export function truncate(value: string): string {
  return value.length > 200 ? `${value.slice(0, 200)}...` : value;
}

export function toComponent(component: Component) {
  return {
    name: component.name,
    type: component.type,
    filename: component.filename,
    binary_path: component.binary_path,
    code: truncate(component.code)
  };
}
