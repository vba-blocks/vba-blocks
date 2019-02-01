import { parse as parseQuerystring } from 'querystring';
import has from '../utils/has';
import { isString } from '../utils/is';
import { sourceUnrecognizedType } from '../errors';
export function fromSnapshot(snapshot, source) {
    const { name, version, dependencies } = snapshot;
    return {
        id: getRegistrationId(snapshot),
        source,
        name,
        version,
        dependencies
    };
}
export function getRegistrationId(name, version) {
    if (!isString(name)) {
        version = name.version;
        name = name.name;
    }
    return `${name}@${version}`;
}
export function getRegistrationSource(type, value, details) {
    let source = `${type}+${value}`;
    if (details) {
        source += `#${details}`;
    }
    return source;
}
export function getSourceParts(source) {
    const [info, ...details] = source.split('#');
    const [type, ...value] = info.split('+');
    return { type, value: value.join('+'), details: details.join('#') };
}
export function toDependency(registration) {
    const { name, version, source } = registration;
    const { type, value, details } = getSourceParts(source);
    if (type === 'registry') {
        return { name, version, registry: value };
    }
    else if (type === 'git') {
        // For git, tag / branch and/or rev are encoded as querystring
        const gitDetails = parseQuerystring(details);
        return { name, git: value, ...gitDetails };
    }
    else if (type === 'path') {
        return { name, path: value, version };
    }
    else {
        throw sourceUnrecognizedType(type);
    }
}
export function isRegistration(value) {
    return has(value, 'source');
}
