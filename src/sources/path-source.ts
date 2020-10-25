import { CliError, ErrorCode } from "../errors";
import { loadManifest } from "../manifest";
import { Dependency, PathDependency } from "../manifest/dependency";
import { pathExists } from "../utils/fs";
import {
	getRegistrationId,
	getRegistrationSource,
	getSourceParts,
	Registration
} from "./registration";
import { Source } from "./source";

export default class PathSource implements Source {
	async resolve(dependency: Dependency): Promise<Registration[]> {
		const { name, path } = <PathDependency>dependency;
		if (!pathExists(path)) {
			throw new CliError(
				ErrorCode.DependencyPathNotFound,
				`Path not found for dependency "${name}" (${path}).`
			);
		}

		// Load registration details (version and dependencies) from manifest directly
		const manifest = await loadManifest(path);
		const { version, dependencies } = manifest;

		const registration: Registration = {
			id: getRegistrationId(manifest),
			source: getRegistrationSource("path", path),
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
