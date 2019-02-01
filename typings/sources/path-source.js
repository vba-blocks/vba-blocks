import { getSourceParts, getRegistrationId, getRegistrationSource } from './registration';
import { loadManifest } from '../manifest';
import { pathExists } from '../utils/fs';
import { dependencyPathNotFound } from '../errors';
export default class PathSource {
    async resolve(dependency) {
        const { name, path } = dependency;
        if (!pathExists(path)) {
            throw dependencyPathNotFound(name, path);
        }
        // Load registration details (version and dependencies) from manifest directly
        const manifest = await loadManifest(path);
        const { version, dependencies } = manifest;
        const registration = {
            id: getRegistrationId(manifest),
            source: getRegistrationSource('path', path),
            name,
            version,
            dependencies
        };
        return [registration];
    }
    async fetch(registration) {
        // Path dependency is already "fetched", simply return path
        const { value } = getSourceParts(registration.source);
        return value;
    }
}
