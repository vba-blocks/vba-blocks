import { join } from 'path';
import { pathExists, readFile } from 'fs-extra';
import { parse as parseToml } from 'toml';
import env from './env';
import { Snapshot, Manifest } from './manifest';
import { Workspace } from './workspace';

export interface Flags {
  git?: boolean;
}

export interface ConfigValue {
  registry?: { index?: string; packages?: string };
  build?: { script?: { windows?: string; mac?: string } };
  flags?: Flags;
}

export interface Config {
  registry: { index: string; packages: string };
  build: { script: { windows: string; mac: string } };
  flags: Flags;

  resolveRemotePackage: (snapshot: Snapshot) => string;
  resolveLocalPackage: (snapshot: Snapshot) => string;
  resolveSource: (snapshot: Snapshot) => string;
}

export const defaultConfig: ConfigValue = {
  registry: {
    index: 'https://github.com/vba-blocks/registry',
    packages: 'https://packages.vba-blocks.com'
  },
  build: {
    script: {
      windows: join(env.scripts, 'run.vbs'),
      mac: join(env.scripts, 'run.scpt')
    }
  },
  flags: { git: true }
};

export async function loadConfig(): Promise<Config> {
  return resolveConfig([await readConfig(), defaultConfig]);
}

export function resolveConfig(sources: Array<ConfigValue | undefined>): Config {
  const registry = {
    index: resolveValue(sources, 'registry.index'),
    packages: resolveValue(sources, 'registry.packages')
  };

  const build = {
    script: {
      windows: resolveValue(sources, 'build.script.windows'),
      mac: resolveValue(sources, 'build.script.mac')
    }
  };

  const flags = {
    git: resolveValue(sources, 'flags.git')
  };

  const resolveRemotePackage = (snapshot: Snapshot) =>
    join(registry.packages, snapshot.name, `v${snapshot.version}`);
  const resolveLocalPackage = (snapshot: Snapshot) =>
    join(env.packages, snapshot.name, `v${snapshot.version}.block`);
  const resolveSource = (snapshot: Snapshot) =>
    join(
      env.sources,
      snapshot.name,
      `v${snapshot.version}`.replace(/\./g, '-')
    );

  return {
    registry,
    build,
    flags,
    resolveRemotePackage,
    resolveLocalPackage,
    resolveSource
  };
}

export async function readConfig(): Promise<ConfigValue> {
  const file = join(env.cache, 'config.toml');
  if (!await pathExists(file)) return {};

  const raw = await readFile(file);
  const parsed = parseToml(raw.toString());

  return parsed;
}

function resolveValue(
  sources: Array<ConfigValue | undefined>,
  path: string
): any {
  const parts = path.split('.');

  const envValue = env.values[`VBA_BLOCKS_${parts.join('_').toUpperCase()}`];
  if (envValue != null) return envValue;

  for (const source of sources) {
    const value = pick(source, parts);
    if (value != null) return value;
  }
}

function pick(value: any, parts: string | string[]): any {
  if (!Array.isArray(parts)) parts = parts.split('.');

  return parts.reduce((memo, key) => {
    return memo && memo[key];
  }, value);
}
