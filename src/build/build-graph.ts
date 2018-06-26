import { Manifest, Reference } from '../manifest';
import { Project } from '../project';
import { buildInvalid } from '../errors';
import joinCommas from '../utils/join-commas';
import { Component } from './component';

export interface BuildGraph {
  name: string;
  components: Component[];
  references: Reference[];
}

export async function loadBuildGraph(
  project: Project,
  dependencies: Manifest[]
): Promise<BuildGraph> {
  const manifests = [project.manifest, ...dependencies];
  const loading_components: Promise<Component>[] = [];
  const all_references: Reference[] = [];

  for (const manifest of manifests) {
    for (const source of manifest.src) {
      loading_components.push(Component.load(manifest, source));
    }
    for (const reference of manifest.references) {
      all_references.push(reference);
    }
  }

  const components = await Promise.all(loading_components);
  const references = filterReferences(all_references);

  const graph = { name: 'VBAProject', components, references };
  validate(graph);

  return graph;
}

function filterReferences(references: Reference[]): Reference[] {
  const by_name: { [name_guid: string]: boolean } = {};
  return references.filter(reference => {
    const name_guid = `${reference.name}_${reference.guid}`;
    if (by_name[name_guid]) return false;

    return (by_name[name_guid] = true);
  });
}

function validate(graph: BuildGraph) {
  const components_by_name: { [name: string]: Manifest[] } = {};
  const references_by_name: { [name: string]: Reference[] } = {};
  const conflicts = [];

  for (const component of graph.components) {
    if (!components_by_name[component.name])
      components_by_name[component.name] = [];
    components_by_name[component.name].push(component.metadata.manifest!);
  }
  for (const reference of graph.references) {
    if (!references_by_name[reference.name])
      references_by_name[reference.name] = [];
    references_by_name[reference.name].push(reference);
  }

  for (const [name, manifests] of Object.entries(components_by_name)) {
    if (manifests.length > 1) {
      const names = manifests.map(manifest => `"${manifest.name}"`);
      conflicts.push(
        `Source "${name}" is present in manifests named ${joinCommas(names)}`
      );
    }
  }
  for (const [name, references] of Object.entries(references_by_name)) {
    if (references.length > 1) {
      const versions = references.map(reference => reference.version);
      conflicts.push(
        `Reference "${name}" has multiple versions: ${joinCommas(versions)}`
      );
    }
  }

  if (conflicts.length) {
    throw buildInvalid(conflicts.join('\n'));
  }
}
