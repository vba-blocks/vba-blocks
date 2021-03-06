import { env } from "./env";
import { GitSource, PathSource, RegistrySource, Sources } from "./sources";
import { pathExists, readFile } from "./utils/fs";
import { join } from "./utils/path";
import { parse as parseToml } from "./utils/toml";

export type Registry = {} | { [name: string]: { index: string; packages: string } };

export interface Flags {}

export interface Config {
	registry: Registry;
	flags: Flags;
	sources: Sources;
}

export interface ConfigValue {
	registry?: Registry;
	flags?: Flags;
}

const empty: ConfigValue = { registry: {}, flags: {} };
const defaults: ConfigValue = {
	registry: {
		"vba-blocks": {
			index: "https://github.com/vba-blocks/registry",
			packages: "https://packages.vba-blocks.com"
		}
	},
	flags: {}
};

/**
 * Load config, from local, user, and environment values
 *
 * - env:config/config.toml (user)
 * - Search for .vba-blocks/config.toml up from cwd (local)
 * - Load VBA_BLOCKS_* from environment (override)
 */
export async function loadConfig(): Promise<Config> {
	const user: ConfigValue = {
		...empty,
		...((await readConfig(env.config)) || {})
	};

	const dir = await findConfig(env.cwd);
	const local: ConfigValue = {
		...empty,
		...(dir ? await readConfig(dir) : {})
	};

	const override = loadConfigFromEnv();

	const registry: Registry = {
		...defaults.registry,
		...user.registry,
		...local.registry,
		...override.registry
	};
	const flags: Flags = {
		...defaults.flags,
		...user.flags,
		...local.flags,
		...override.flags
	};

	const sources: Sources = {
		registry: {},
		git: new GitSource(),
		path: new PathSource()
	};

	for (const [name, { index, packages }] of Object.entries(registry)) {
		sources.registry[name] = new RegistrySource({
			name,
			index,
			packages
		});
	}

	return { registry, flags, sources };
}

// Read config from dir (if present)
export async function readConfig(dir: string): Promise<ConfigValue | undefined> {
	const file = join(dir, "config.toml");
	if (!(await pathExists(file))) return {};

	const raw = await readFile(file);
	const parsed = await parseToml(raw.toString());

	return parsed;
}

// Find config up from and including given dir
// (looking for .vba-blocks/config.toml)
export async function findConfig(dir: string): Promise<string | undefined> {
	// TODO Search for .vba-blocks/config.toml starting at cwd
	return;
}

// Load config values from environment
export function loadConfigFromEnv(): ConfigValue {
	// TODO Load override config from VBA_BLOCKS_* env variables
	return {};
}
