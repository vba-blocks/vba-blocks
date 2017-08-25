import { join } from 'path';
import { homedir } from 'os';

export interface Config {
  cwd: string;
  build: string;
  scripts: string;
  addins: string;
  cache: string;
  registry: { local: string; remote: string };
  resolveRemotePackage: (name: string, version: string) => string;
  resolveLocalPackage: (name: string, version: string) => string;
  resolveSource: (name: string, version: string) => string;
}

export function loadConfig() {
  const cwd = process.cwd();
  const build = join(cwd, 'build');
  const scripts = join(__dirname, '../scripts');
  const addins = join(__dirname, '../../addin/build');
  const cache = join(homedir(), '.vba-blocks');
  const registry = {
    local: join(cache, 'registry'),
    remote: 'https://github.com/vba-blocks/registry.git'
  };

  const resolveRemotePackage = (name, version) =>
    `https://packages.vba-blocks.com/${name}/v${version}.tar.gz`;
  const resolveLocalPackage = (name, version) =>
    join(cache, `packages/${name}/v${version}.tar.gz`);
  const resolveSource = (name, version) =>
    join(cache, `sources/${name}/v${version}`);

  const config: Config = {
    cwd,
    build,
    scripts,
    addins,
    cache,
    registry,
    resolveRemotePackage,
    resolveLocalPackage,
    resolveSource
  };

  return config;
}
