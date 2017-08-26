import { exists, read } from 'fs-extra';
import { join } from 'path';
import * as assert from 'assert';
import * as toml from 'toml';
import { Source, parseSource } from './source';
import { Feature, parseFeature } from './feature';
import { Dependency, parseDependency } from './dependency';
import { Target, parseTarget } from './target';
import { Reference, parseReference } from './reference';
import { mapObject, isString } from '../utils';

export { Source, Dependency, Target };

export interface Manifest {
  pkg: {
    name: string;
    version: string;
    authors: string[];
  };
  src: Source[];
  features: Feature[];
  dependencies: Dependency[];
  targets: Target[];
  references: Reference[];
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

  const pkg = {
    name: parsed.package.name,
    version: parsed.package.version,
    authors: parsed.package.authors
  };

  const src = mapObject(parsed.src, (value, name) => parseSource(name, value));
  const dependencies = mapObject(parsed.dependencies, (value, name) =>
    parseDependency(name, value)
  );
  const targets = (parsed.targets || [])
    .map(target => parseTarget(target, pkg.name));
  const features = mapObject(parsed.features, (value, name) =>
    parseFeature(name, value)
  );
  const references = mapObject(parsed.references, (value, name) =>
    parseReference(name, value)
  );

  return { pkg, src, features, dependencies, targets, references };
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
