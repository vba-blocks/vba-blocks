import { Reference } from "../manifest/reference";
import { BuildGraph } from "./build-graph";
import { Changeset } from "./changeset";
import { byComponentName, Component } from "./component";

export function compareBuildGraphs(before: BuildGraph, after: BuildGraph): Changeset {
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
	const byName = {
		components: new Map<string, Component>(),
		references: new Map<string, Reference>()
	};
	for (const component of before.components) {
		byName.components.set(component.name, component);
	}
	for (const reference of before.references) {
		byName.references.set(reference.name, reference);
	}

	// Determine component changes
	for (const component of after.components) {
		const name = component.name;

		const beforeComponent = byName.components.get(name);
		byName.components.delete(name);

		if (beforeComponent && before.fromDependencies.components.has(beforeComponent)) {
			// Ignore dependencies
			continue;
		} else if (!beforeComponent) {
			changeset.components.added.push(component);
		} else if (component.code !== beforeComponent.code) {
			component.details.path = beforeComponent.details.path;

			changeset.components.changed.push(component);
		}
	}
	for (const component of byName.components.values()) {
		changeset.components.removed.push(component);
	}

	changeset.components.added.sort(byComponentName);
	changeset.components.changed.sort(byComponentName);
	changeset.components.removed.sort(byComponentName);

	// Determine reference changes
	for (const reference of after.references) {
		const name = reference.name;

		const before_reference = byName.references.get(name);
		byName.references.delete(name);

		if (before_reference && before.fromDependencies.references.has(before_reference)) {
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
	for (const reference of byName.references.values()) {
		changeset.references.removed.push(reference);
	}

	return changeset;
}
