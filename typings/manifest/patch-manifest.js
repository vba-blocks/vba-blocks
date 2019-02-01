import dedent from 'dedent/macro';
import { relative } from '../utils/path';
import { isRegistryDependency, isPathDependency } from './dependency';
import { patchApplyChanges, patchAddSrc, patchRemoveSrc, patchAddDependency, patchRemoveDependency, patchAddReference, patchRemoveReference } from '../messages';
import env from '../env';
export function applyChanges(changes) {
    if (!changes.length)
        return;
    env.reporter.log(`${patchApplyChanges()}\n\n${changes.join('\n\n')}`);
}
export function addSource(manifest, source) {
    const relative_path = relative(manifest.dir, source.path);
    const relative_binary_path = source.binary && relative(manifest.dir, source.binary);
    const details = relative_binary_path
        ? `{ path = "${relative_path}", binary = "${relative_binary_path}" }`
        : `"${relative_path}"`;
    return dedent `
    ${patchAddSrc()}
    ${source.name} = ${details}`;
}
export function removeSource(_, name) {
    return patchRemoveSrc(name);
}
export function addDependency(manifest, dependency) {
    let details;
    if (isRegistryDependency(dependency)) {
        const { version, registry } = dependency;
        details =
            registry !== 'vba-blocks'
                ? `{ version = "${version}", registry = "${registry}" }`
                : `"${version}"`;
    }
    else if (isPathDependency(dependency)) {
        const relative_path = relative(manifest.dir, dependency.path);
        details = `{ path = "${relative_path}" }`;
    }
    else {
        const { git, tag, branch, rev } = dependency;
        if (rev) {
            details = `{ git = "${git}", rev = "${rev}" }`;
        }
        else if (tag) {
            details = `{ git = "${git}", tag = "${tag}" }`;
        }
        else if (branch !== 'master') {
            details = `{ git = "${git}", branch = "${branch}" }`;
        }
        else {
            details = `{ git = "${git}" }`;
        }
    }
    return dedent `
    ${patchAddDependency()}
    ${dependency.name} = ${details}`;
}
export function removeDependency(_, name) {
    return patchRemoveDependency(name);
}
export function addReference(_manifest, reference) {
    const details = `{ version = "${reference.version}", guid = "${reference.guid}" }`;
    return dedent `
    ${patchAddReference()}
    ${reference.name} = ${details}`;
}
export function removeReference(_manifest, name) {
    return patchRemoveReference(name);
}
export function addTarget(manifest, target) {
    const relative_path = relative(manifest.dir, target.path);
    let details;
    if (target.name !== manifest.name && relative_path !== 'target') {
        details = target.type;
    }
    else {
        details = `{ type = "${target.type}"`;
        if (target.name !== manifest.name)
            details += `, name = "${target.name}"`;
        if (relative_path !== 'target')
            details += `, path = "${relative_path}"`;
        details += ' }';
    }
    return dedent `
    Add the following to the [${manifest.type}] section:
    target = ${details}`;
}
