import { dir as FIXTURES } from '../../tests/__fixtures__';
import { Manifest } from '../manifest';
import { isPathDependency } from '../manifest/dependency';
import { relative } from '../utils/path';

export function normalizeManifest(manifest: Manifest, relativeTo: string = FIXTURES): Manifest {
  for (const src of manifest.src) {
    src.path = normalizePath(src.path, relativeTo);

    if (src.binary) {
      src.binary = normalizePath(src.binary, relativeTo);
    }
  }
  for (const dependency of manifest.dependencies) {
    if (isPathDependency(dependency)) {
      dependency.path = normalizePath(dependency.path, relativeTo);
    }
  }
  for (const src of manifest.devSrc) {
    src.path = normalizePath(src.path, relativeTo);

    if (src.binary) {
      src.binary = normalizePath(src.binary, relativeTo);
    }
  }
  for (const dependency of manifest.devDependencies) {
    if (isPathDependency(dependency)) {
      dependency.path = normalizePath(dependency.path, relativeTo);
    }
  }

  if (manifest.target) {
    manifest.target.path = normalizePath(manifest.target.path, relativeTo);
  }

  return manifest;
}

function normalizePath(path: string, relativeTo: string = FIXTURES): string {
  return relative(relativeTo, path);
}
