import { exists, ensureDir } from 'fs-extra';
import tar from 'tar';
import { Config } from './config';
import { download } from './utils';

export interface PackageInfo {
  name: string;
  version: string;
}

export async function fetchPackage(config: Config, pkg: PackageInfo) {
  const url = config.resolveRemotePackage(pkg);
  const dest = config.resolveLocalPackage(pkg);

  if (!await exists(dest)) {
    await download(url, dest);
  }
}

export async function extractPackage(config: Config, pkg: PackageInfo) {
  const file = config.resolveLocalPackage(pkg);
  const dest = config.resolveSource(pkg);

  await ensureDir(dest);
  await tar.extract({ file, cwd: dest });
}
