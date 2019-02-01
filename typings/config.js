import { join } from './utils/path';
import { pathExists, readFile } from './utils/fs';
import { parse as parseToml } from './utils/toml';
import env from './env';
import { RegistrySource, PathSource, GitSource } from './sources';
const empty = { registry: {}, flags: {} };
const defaults = {
    registry: {
        'vba-blocks': {
            index: 'https://github.com/vba-blocks/registry',
            packages: 'https://packages.vba-blocks.com'
        }
    },
    flags: {}
};
/**
 * Load config, from local, user, and environment values
 *
 * - Load ~/.vba-blocks/config.toml (user)
 * - Search for .vba-blocks/config.toml up from cwd (local)
 * - Load VBA_BLOCKS_* from environment (override)
 */
export async function loadConfig() {
    const user = {
        ...empty,
        ...((await readConfig(env.cache)) || {})
    };
    const dir = await findConfig(env.cwd);
    const local = {
        ...empty,
        ...(dir ? await readConfig(dir) : {})
    };
    const override = loadConfigFromEnv();
    const registry = {
        ...defaults.registry,
        ...user.registry,
        ...local.registry,
        ...override.registry
    };
    const flags = {
        ...defaults.flags,
        ...user.flags,
        ...local.flags,
        ...override.flags
    };
    const sources = {
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
export async function readConfig(dir) {
    const file = join(dir, 'config.toml');
    if (!(await pathExists(file)))
        return {};
    const raw = await readFile(file);
    const parsed = await parseToml(raw.toString());
    return parsed;
}
// Find config up from and including given dir
// (looking for .vba-blocks/config.toml)
export async function findConfig(dir) {
    // TODO Search for .vba-blocks/config.toml starting at cwd
    return;
}
// Load config values from environment
export function loadConfigFromEnv() {
    // TODO Load override config from VBA_BLOCKS_* env variables
    return {};
}
