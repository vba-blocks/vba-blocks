import { join } from 'path';
import { pathExists, readFile } from 'fs-extra';
import { parse as parseToml } from 'toml';
import env from './env';

export interface Config {
  registry: { [name: string]: { index: string; packages: string } };
  flags: {
    git?: boolean;
    path?: boolean;
  };
}

export async function loadConfig(): Promise<Config> {
  const empty = { registry: {}, flags: {} };

  const defaults = {
    registry: {
      'vba-blocks': {
        index: 'https://github.com/vba-blocks/registry',
        packages: 'https://packages.vba-blocks.com'
      }
    },
    flags: { git: true, path: true }
  };

  const user = { ...empty, ...((await readConfig(env.cache)) || {}) };

  const file = await findConfig(env.cwd);
  const local = { ...empty, ...file ? await readConfig(file) : {} };

  const override = loadConfigFromEnv();

  const registry = {
    ...defaults.registry,
    ...user.registry,
    ...local.registry,
    ...override.flags
  };
  const flags = {
    ...defaults.flags,
    ...user.flags,
    ...local.flags,
    ...override.flags
  };

  return { registry, flags };
}

export async function readConfig(dir: string): Promise<any | undefined> {
  const file = join(dir, 'config.toml');
  if (!await pathExists(file)) return {};

  const raw = await readFile(file);
  const parsed = parseToml(raw.toString());

  return parsed;
}

export async function findConfig(dir: string): Promise<string | undefined> {
  // TODO Search from .vba-blocks/config.toml starting at cwd
  return;
}

export function loadConfigFromEnv(): any {
  // TODO Load override config from VBA_BLOCKS_* env variables
  return {};
}
