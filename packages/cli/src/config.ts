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

const defaults: ConfigValue = {
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

export async function loadConfig(
  manifest?: Manifest,
  workspace?: Workspace
): Promise<Config> {
  const configSources = [
    manifest && manifest.config,
    workspace && workspace.root.config,
    await readConfig(),
    defaults
  ];

  const registry = {
    index: resolveConfig(configSources, 'registry.index'),
    packages: resolveConfig(configSources, 'registry.packages')
  };

  const build = {
    script: {
      windows: resolveConfig(configSources, 'build.script.windows'),
      mac: resolveConfig(configSources, 'build.script.mac')
    }
  };

  const flags = {
    git: resolveConfig(configSources, 'flags.git')
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

function resolveConfig(sources: ConfigValue[], path: string): any {
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
