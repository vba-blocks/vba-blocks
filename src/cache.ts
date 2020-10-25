import Conf from "conf";
import env from "./env";

export class Cache extends Conf {
	constructor(cwd = env.data) {
		super({ configName: "cache", fileExtension: "json", cwd });
	}

	get latest_version(): string | undefined {
		return this.get("latest_version") as string | undefined;
	}
	set latest_version(version: string | undefined) {
		this.set("latest_version", version);
	}

	get latest_version_checked(): number | undefined {
		return this.get("latest_version_checked") as number | undefined;
	}
	set latest_version_checked(timestamp: number | undefined) {
		this.set("latest_version_checked", timestamp);
	}
}

export default new Cache();
