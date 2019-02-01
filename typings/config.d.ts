import { Config, ConfigValue } from './types';
/**
 * Load config, from local, user, and environment values
 *
 * - Load ~/.vba-blocks/config.toml (user)
 * - Search for .vba-blocks/config.toml up from cwd (local)
 * - Load VBA_BLOCKS_* from environment (override)
 */
export declare function loadConfig(): Promise<Config>;
export declare function readConfig(dir: string): Promise<ConfigValue | undefined>;
export declare function findConfig(dir: string): Promise<string | undefined>;
export declare function loadConfigFromEnv(): ConfigValue;
