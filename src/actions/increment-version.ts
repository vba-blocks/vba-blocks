import { inc, ReleaseType, valid } from "semver";
import { CliError, ErrorCode } from "../errors";
import { writeManifest } from "../manifest";
import { loadProject } from "../project";

interface IncrementVersionOptions {
	preid?: string;
}

const RELEASE_TYPES = ["patch", "minor", "major", "prepatch", "preminor", "premajor", "prerelease"];

export async function incrementVersion(
	increment: string,
	options: IncrementVersionOptions = {}
): Promise<string> {
	const project = await loadProject();

	const currentVersion = project.manifest.version;
	const isIncrement = isReleaseType(increment);

	let version;
	try {
		version = isIncrement
			? inc(currentVersion, increment as ReleaseType, undefined, options.preid)
			: valid(increment);
	} catch (_error) {}

	if (!version) {
		throw new CliError(ErrorCode.InvalidVersion, `Invalid version increment "${increment}"`);
	}

	project.manifest.version = version;
	await writeManifest(project.manifest, project.paths.dir);

	return version;
}

function isReleaseType(value: string): value is ReleaseType {
	return RELEASE_TYPES.includes(value);
}
