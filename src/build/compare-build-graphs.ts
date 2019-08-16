import { Reference } from '../manifest/reference';
import { BuildGraph } from './build-graph';
import { Changeset } from './changeset';
import { byComponentName, Component } from './component';

export default function compareBuildGraphs(before: BuildGraph, after: BuildGraph): Changeset {
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

  // First, cache _before_ BuildGraph by name
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

    const before_component = by_name.components.get(name);
    by_name.components.delete(name);

    if (before_component && before.from_dependencies.components.has(before_component)) {
      // Ignore dependencies
      continue;
    } else if (!before_component) {
      changeset.components.added.push(component);
    } else if (component.code !== before_component.code) {
      component.details.path = before_component.details.path;

      changeset.components.changed.push(component);
    }
  }
  for (const component of by_name.components.values()) {
    changeset.components.removed.push(component);
  }

  changeset.components.added.sort(byComponentName);
  changeset.components.changed.sort(byComponentName);
  changeset.components.removed.sort(byComponentName);

  // Determine reference changes
  for (const reference of after.references) {
    const name = reference.name;

    const before_reference = by_name.references.get(name);
    by_name.references.delete(name);

    if (before_reference && before.from_dependencies.references.has(before_reference)) {
      // Ignore dependencies
      continue;
    } else if (!before_reference) {
      changeset.references.added.push(reference);
    } else if (
      reference.guid !== before_reference.guid ||
      reference.major !== before_reference.major ||
      reference.minor !== before_reference.minor
    ) {
      changeset.references.changed.push(reference);
    }
  }
  for (const reference of by_name.references.values()) {
    changeset.references.removed.push(reference);
  }

  return changeset;
}
