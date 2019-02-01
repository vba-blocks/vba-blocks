import { Component, byComponentName } from './component';
import { joinCommas } from '../utils/text';
import { buildInvalid } from '../errors';
export default async function loadFromProject(project, dependencies) {
    const manifests = [project.manifest, ...dependencies];
    const loading_components = [];
    const references = [];
    const found_references = {};
    // Load components and references from project and dependencies
    for (const manifest of manifests) {
        for (const source of manifest.src) {
            loading_components.push(Component.load(source.path, {
                dependency: manifest === project.manifest ? undefined : manifest.name,
                binary_path: source.binary
            }));
        }
        for (const reference of manifest.references) {
            const name_guid = `${reference.name}_${reference.guid}`;
            if (found_references[name_guid])
                continue;
            const dependency = manifest === project.manifest ? undefined : manifest.name;
            references.push(Object.assign({ details: { dependency } }, reference));
            found_references[name_guid] = true;
        }
    }
    const components = (await Promise.all(loading_components)).sort(byComponentName);
    const graph = { name: 'VBAProject', components, references };
    validateGraph(project, graph);
    return graph;
}
function validateGraph(project, graph) {
    const components_by_name = {};
    const references_by_name = {};
    const errors = [];
    for (const component of graph.components) {
        if (!components_by_name[component.name])
            components_by_name[component.name] = [];
        components_by_name[component.name].push(component.details.dependency || project.manifest.name);
    }
    for (const reference of graph.references) {
        if (!references_by_name[reference.name])
            references_by_name[reference.name] = [];
        references_by_name[reference.name].push(reference);
    }
    for (const [name, from] of Object.entries(components_by_name)) {
        if (from.length > 1) {
            const names = from.map(name => `"${name}"`);
            errors.push(`Source "${name}" is present in manifests named ${joinCommas(names)}`);
        }
    }
    for (const [name, references] of Object.entries(references_by_name)) {
        if (references.length > 1) {
            const versions = references.map(reference => reference.version);
            errors.push(`Reference "${name}" has multiple versions: ${joinCommas(versions)}`);
        }
    }
    if (errors.length) {
        throw buildInvalid(errors.join('\n'));
    }
}
