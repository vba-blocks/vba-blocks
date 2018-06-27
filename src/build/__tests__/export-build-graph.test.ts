import { setup, reset } from '../../../tests/__helpers__/project';
import { standard } from '../../../tests/__fixtures__';
import { loadBuildGraph } from '../build-graph';
import { Component } from '../component';
import exportBuildGraph from '../export-build-graph';

afterEach(reset);

test('should export build graph for project', async () => {
  const { project, dependencies } = await setup(standard);
  const graph = await loadBuildGraph(project, dependencies);

  // Add, update, and remove component
  graph.components.push(
    new Component({
      type: 'module',
      code: 'Attribute VB_Name = "added"\r\n\' added\r\n',
      source: { name: 'added', path: 'added.bas' }
    })
  );

  const update = graph.components.find(
    component => component.name === 'ThisWorkbook'
  );
  update.code = `' (updated)`;

  const remove = graph.components.findIndex(
    component => component.name === 'Validation'
  );
  graph.components.splice(remove, 1);

  jest.spyOn(console, 'log').mockImplementation(() => {});
  await exportBuildGraph(project, dependencies, graph);

  const logs = console.log.mock.calls;
  console.log.mockRestore();

  console.log(logs);
});
