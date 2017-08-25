import { exists, ensureDir } from 'fs-extra';
import tar from 'tar';
import { Config } from './config';
import { download } from './utils';

export interface PackageInfo {
  name: string;
  version: string;
}

export async function fetchPackage(config: Config, pkg: PackageInfo) {
  const { name, version } = pkg;
  const url = config.resolveRemotePackage(name, version);
  const dest = config.resolveLocalPackage(name, version);

  if (!await exists(dest)) {
    await download(url, dest);
  }
}

export async function extractPackage(config: Config, pkg: PackageInfo) {
  const { name, version } = pkg;
  const file = config.resolveLocalPackage(name, version);
  const dest = config.resolveSource(name, version);

  await ensureDir(dest);
  await tar.extract({ file, cwd: dest });
}
