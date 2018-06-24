import { Manifest, Source, Reference } from '../manifest';
import { Project } from '../project';
import { BuildGraph } from './build-graph';
import { Component } from './component';

export interface Changeset<T, U> {
  added: T[];
  existing: T[];
  removed: U[];
  dependencies: T[];
}

interface ByName {
  components: Map<string, Source>;
  references: Map<string, Reference>;
}

export function diffBuildGraph(
  project: Project,
  dependencies: Manifest[],
  graph: BuildGraph
): {
  components: Changeset<Component, Source>;
  references: Changeset<Reference, Reference>;
} {
  // Roll up components and references for project and dependencies
  const project_info = getByName(project.manifest);
  const dependencies_info = getByName(dependencies);

  // Categorize components and references
  // (added, existing, removed, dependencies)
  const components: Changeset<Component, Source> = {
    added: [],
    existing: [],
    removed: [],
    dependencies: []
  };
  const found_components = new Set<string>();

  for (const component of graph.components) {
    if (dependencies_info.components.has(component.name)) {
      components.dependencies.push(component);
    } else if (project_info.components.has(component.name)) {
      components.existing.push(component);
      found_components.add(component.name);
    } else {
      components.added.push(component);
    }
  }
  components.removed = project.manifest.src.filter(
    source => !found_components.has(source.name)
  );

  const references: Changeset<Reference, Reference> = {
    added: [],
    existing: [],
    removed: [],
    dependencies: []
  };
  const found_references = new Set<string>();

  for (const reference of graph.references) {
    if (dependencies_info.references.has(reference.name)) {
      references.dependencies.push(reference);
    } else if (project_info.references.has(reference.name)) {
      references.existing.push(reference);
      found_references.add(reference.name);
    } else {
      references.added.push(reference);
    }
  }
  references.removed = project.manifest.references.filter(
    reference => !found_references.has(reference.name)
  );

  return { components, references };
}

function getByName(manifests: Manifest | Manifest[]): ByName {
  if (!Array.isArray(manifests)) manifests = [manifests];

  const by_name = {
    components: new Map(),
    references: new Map()
  };

  for (const manifest of manifests) {
    for (const source of manifest.src) {
      by_name.components.set(source.name, source);
    }
    for (const reference of manifest.references) {
      by_name.references.set(reference.name, reference);
    }
  }

  return by_name;
}
