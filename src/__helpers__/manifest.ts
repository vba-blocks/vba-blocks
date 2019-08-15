import { Manifest } from '../manifest';
import { isPathDependency } from '../manifest/dependency';
import { relative } from '../utils/path';
import { dir as FIXTURES } from '../../tests/__fixtures__';

export function normalizeManifest(manifest: Manifest, relativeTo: string = FIXTURES): Manifest {
  manifest.dir = normalizePath(manifest.dir, relativeTo);

  for (const src of manifest.src) {
    src.path = normalizePath(src.path, relativeTo);

    if (src.binary) {
      src.binary = normalizePath(src.binary, relativeTo);
    }
  }
  if (manifest.target) {
    manifest.target.path = normalizePath(manifest.target.path, relativeTo);
  }
  for (const dependency of manifest.dependencies) {
    if (isPathDependency(dependency)) {
      dependency.path = normalizePath(dependency.path, relativeTo);
    }
  }

  return manifest;
}

function normalizePath(path: string, relativeTo: string = FIXTURES): string {
  return relative(relativeTo, path);
}
