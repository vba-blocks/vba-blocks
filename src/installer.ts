import { differenceInCalendarDays } from "date-fns";
import { gt as semverGreaterThan } from "semver";
import { version as current_version } from "../package.json";
import cache from "./cache";
import env from "./env";
import { getLatestRelease } from "./utils/github";

const debug = env.debug("vba-blocks:installer");

export function updateVersion(): string | undefined {
	return cache.latest_version;
}

export function updateAvailable(): boolean {
	// Previously checked version is greater
	const latest_known_version = cache.latest_version;
	return !!latest_known_version && semverGreaterThan(latest_known_version, current_version);
}

export async function checkForUpdate(): Promise<boolean> {
	// Only check for new version once per day
	const last_checked = cache.latest_version_checked;
	if (last_checked && differenceInCalendarDays(new Date(last_checked), Date.now()) < 1)
		return updateAvailable();

	// Allow skipping from the outside
	// set VBA_BLOCKS_SKIP_UPDATE_CHECK=1
	//
	// (maybe this should be added to config)
	if (parseInt(env.values.VBA_BLOCKS_SKIP_UPDATE_CHECK, 10)) return false;

	cache.latest_version_checked = Date.now();

	try {
		const { tag_name: latest_version } = await getLatestRelease({
			owner: "vba-blocks",
			repo: "vba-blocks"
		});
		cache.latest_version = latest_version;

		return semverGreaterThan(latest_version, current_version);
	} catch (error) {
		debug("Error loading latest release");
		debug(error);
		return false;
	}
}
