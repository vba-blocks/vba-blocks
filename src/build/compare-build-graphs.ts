import { Reference } from '../manifest';
import { BuildGraph } from './build-graph';
import { Component } from './component';

export interface Changeset {
  components: {
    added: Component[];
    changed: Component[];
    removed: Component[];
  };
  references: {
    added: Reference[];
    changed: Reference[];
    removed: Reference[];
  };
}

export function compareBuildGraphs(
  before: BuildGraph,
  after: BuildGraph
): Changeset {
  const changeset: Changeset = {
    components: {
      added: [],
      changed: [],
      removed: []
    },
    references: {
      added: [],
      changed: [],
      removed: []
    }
  };

  // First, cache before BuildGraph by name
  const by_name = {
    components: new Map<string, Component>(),
    references: new Map<string, Reference>()
  };
  for (const component of before.components) {
    by_name.components.set(component.name, component);
  }
  for (const reference of before.references) {
    by_name.references.set(reference.name, reference);
  }

  // Determine component changes
  for (const component of after.components) {
    const name = component.name;

    const previous = by_name.components.get(name);
    by_name.components.delete(name);

    if (previous && previous.details.dependency) {
      // Ignore dependencies
      continue;
    } else if (!previous) {
      changeset.components.added.push(component);
    } else if (component.code !== previous.code) {
      component.details.path = previous.details.path;
      component.details.dependency = previous.details.dependency;

      changeset.components.changed.push(component);
    }
  }
  for (const component of by_name.components.values()) {
    changeset.components.removed.push(component);
  }

  // Determine reference changes
  for (const reference of after.references) {
    // TODO
    // - determine if reference is from dependency
  }

  return changeset;
}
