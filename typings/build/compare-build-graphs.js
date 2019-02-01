import { byComponentName } from './component';
export default function compareBuildGraphs(before, after) {
    const changeset = {
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
        components: new Map(),
        references: new Map()
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
        }
        else if (!previous) {
            changeset.components.added.push(component);
        }
        else if (component.code !== previous.code) {
            component.details.path = previous.details.path;
            component.details.dependency = previous.details.dependency;
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
        const previous = by_name.references.get(name);
        by_name.references.delete(name);
        if (previous && previous.details.dependency) {
            // Ignore dependencies
            continue;
        }
        else if (!previous) {
            changeset.references.added.push(reference);
        }
        else if (reference.guid !== previous.guid ||
            reference.major !== previous.major ||
            reference.minor !== previous.minor) {
            reference.details.dependency = previous.details.dependency;
            changeset.references.changed.push(reference);
        }
    }
    for (const reference of by_name.references.values()) {
        changeset.references.removed.push(reference);
    }
    return changeset;
}
