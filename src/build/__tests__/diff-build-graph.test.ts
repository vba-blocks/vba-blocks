import { setup, reset } from '../../../tests/__helpers__/project';
import { standard } from '../../../tests/__fixtures__';
import { loadBuildGraph } from '../build-graph';
import { diffBuildGraph, Changeset } from '../diff-build-graph';
import { Component } from '../component';
import { Source, Reference } from '../../manifest';
import { truncate, toComponent } from './build-graph.test';

afterEach(reset);

test('should diff build graph', async () => {
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

  expect(
    normalizeChanges(diffBuildGraph(project, dependencies, graph))
  ).toMatchSnapshot();
});

interface Changes {
  components: Changeset<Component, Source>;
  references: Changeset<Reference, Reference>;
}

function normalizeChanges(changes: Changes) {
  const { components, references } = changes;

  return {
    components: {
      existing: components.existing.map(toComponent),
      added: components.added.map(toComponent),
      removed: components.removed
    },
    references
  };
}
