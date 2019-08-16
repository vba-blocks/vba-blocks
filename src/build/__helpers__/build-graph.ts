import { dir } from '../../../tests/__fixtures__';
import { BuildGraph } from '../build-graph';
import { normalizeComponent } from './component';

export function normalizeBuildGraph(graph: BuildGraph) {
  const { name, components, references, from_dependencies } = graph;

  const from_components: { [name: string]: string } = {};
  for (const [component, dependency] of from_dependencies.components.entries()) {
    from_components[component.name] = dependency;
  }

  const from_references: { [name: string]: string } = {};
  for (const [reference, dependency] of from_dependencies.references.entries()) {
    from_references[reference.name] = dependency;
  }

  return {
    name,
    components: components.map(component => normalizeComponent(component, dir)),
    references,
    from_dependencies: {
      components: from_components,
      references: from_references
    }
  };
}
