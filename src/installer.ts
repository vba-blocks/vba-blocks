import { differenceInCalendarDays } from "date-fns";
import { gt as semverGreaterThan } from "semver";
import { version as currentVersion } from "../package.json";
import { cache } from "./cache";
import { env } from "./env";
import { getLatestRelease } from "./utils/github";

const debug = env.debug("vba-blocks:installer");

export function updateVersion(): string | undefined {
	return cache.latest_version;
}

export function updateAvailable(): boolean {
	// Previously checked version is greater
	const latestKnownVersion = cache.latest_version;
	return !!latestKnownVersion && semverGreaterThan(latestKnownVersion, currentVersion);
}

export async function checkForUpdate(): Promise<boolean> {
	// Only check for new version once per day
	const lastChecked = cache.latest_version_checked;
	if (lastChecked && differenceInCalendarDays(new Date(lastChecked), Date.now()) < 1)
		return updateAvailable();

	// Allow skipping from the outside
	// set VBA_BLOCKS_SKIP_UPDATE_CHECK=1
	//
	// (maybe this should be added to config)
	if (parseInt(env.values.VBA_BLOCKS_SKIP_UPDATE_CHECK, 10)) return false;

	cache.latest_version_checked = Date.now();

	try {
		const { tag_name: latestVersion } = await getLatestRelease({
			owner: "vba-blocks",
			repo: "vba-blocks"
		});
		cache.latest_version = latestVersion;

		return semverGreaterThan(latestVersion, currentVersion);
	} catch (error) {
		debug("Error loading latest release");
		debug(error);
		return false;
	}
}
