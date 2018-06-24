import { resolveProject } from '../../../tests/__helpers__';
import { complex as project } from '../../../tests/__fixtures__/projects';
import { loadBuildGraph } from '../build-graph';
import { diffBuildGraph } from '../diff-build-graph';
import { Component } from '../component';
import { fetchDependencies } from '../../project';

test('should diff build graph', async () => {
  const resolved = await resolveProject(project);
  const dependencies = await fetchDependencies(resolved);

  const graph = await loadBuildGraph(resolved, dependencies);

  // Add, update, and remove component
  graph.components.push(
    new Component({
      type: 'module',
      code: 'Attribute VB_Name = "added"\r\n\' added\r\n',
      source: { name: 'added', path: 'added.bas' }
    })
  );

  // TODO add src to complex project to test update and remove

  expect(diffBuildGraph(resolved, dependencies, graph)).toMatchSnapshot();
});
