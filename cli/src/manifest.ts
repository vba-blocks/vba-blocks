import { exists, read } from 'fs-extra';
import { join } from 'path';
import * as assert from 'assert';
import * as toml from 'toml';
import { mapObject, isString } from './utils';

export type TargetType = 'xlsx' | 'xlsm' | 'xlam';

export interface Source {}
export interface Dependency {}
export interface Target {
  name: string;
  type: TargetType;
  path: string;
}

export interface Manifest {
  metadata: {
    name: string;
    version: string;
    authors: string[];
  };
  sources: Source[];
  dependencies: Dependency[];
  targets: Target[];
}

export function parseManifest(raw: Buffer): Manifest {
  const parsed = toml.parse(raw.toString());

  assert.ok(
    parsed.package,
    '[package] is a required field, with name, version, and authors specified'
  );
  assert.ok(parsed.package.name, '[package] name is a required field');
  assert.ok(parsed.package.version, '[package] version is a required field');
  assert.ok(parsed.package.authors, '[package] authors is a required field');

  const metadata = {
    name: parsed.package.name,
    version: parsed.package.version,
    authors: parsed.package.authors
  };

  const sources = mapObject(parsed.src, (details, name) => {
    if (isString(details)) details = { path: details };

    const src = Object.assign(details, { name });
    return src;
  });

  const dependencies = mapObject(parsed.dependencies, (details, name) => {
    if (isString(details)) details = { version: details };

    const dependency = Object.assign(details, { name });
    return dependency;
  });

  const targets = (parsed.targets || []).map(target => {
    if (!target.name) {
      target.name = parsed.package.name;
    }

    return target;
  });

  return { metadata, sources, dependencies, targets };
}

export async function loadManifest(dir: string) {
  const file = join(dir, 'vba-block.toml');
  if (!await exists(file)) {
    throw new Error(`vba-blocks.toml not found in "${dir}"`);
  }

  const raw = await read(file);
  const manifest = parseManifest(raw);

  return manifest;
}
