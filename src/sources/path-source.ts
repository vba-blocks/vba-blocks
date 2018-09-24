import {
  Registration,
  getSourceParts,
  getRegistrationId,
  getRegistrationSource
} from './registration';
import { loadManifest } from '../manifest';
import { Dependency, PathDependency } from '../manifest/dependency';
import { Source } from './source';
import { pathExists } from '../utils/fs';

export default class PathSource implements Source {
  async resolve(dependency: Dependency): Promise<Registration[]> {
    const { name, path } = <PathDependency>dependency;
    if (!pathExists(path)) {
      // TODO "official" error
      throw new Error(`Path not found for dependency "${name}" (${path})`);
    }

    // Load registration details (version and dependencies) from manifest directly
    const manifest = await loadManifest(path);
    const { version, dependencies } = manifest;

    const registration: Registration = {
      id: getRegistrationId(manifest),
      source: getRegistrationSource('path', path),
      name,
      version,
      dependencies
    };

    return [registration];
  }

  async fetch(registration: Registration): Promise<string> {
    // Path dependency is already "fetched", simply return path
    const { value } = getSourceParts(registration.source);
    return value;
  }
}
