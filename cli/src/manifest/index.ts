import { exists, read } from 'fs-extra';
import { join } from 'path';
import * as assert from 'assert';
import * as toml from 'toml';
import { Source, parseSrc } from './source';
import { Feature, parseFeatures } from './feature';
import { Dependency, parseDependencies } from './dependency';
import { Reference, parseReferences } from './reference';
import { Target, parseTargets } from './target';

export { Source, Feature, Dependency, Reference, Target };

/**
 * @example
 * ```toml
 * [package]
 * name = "package-name"
 * version = "1.0.0-rc.1"
 * authors = ["Tim Hall <tim.hall.engr@gmail.com> (https://github.com/timhall)"]
 * 
 * [src]
 * A = "src/a.bas"
 * B = { path = "src/b.cls" }
 * C = { path = "src/c.frm", optional = true }
 * 
 * [features]
 * default = ["a"]
 * 
 * a = { src = ["C"] }
 * b = { dependencies = ["dictionary"] }
 * c = { references = ["Scripting"] }
 * 
 * [dependencies]
 * dictionary = "v1.4.1"
 * with-features = { version = "1.0.0", default-features = false, features = ["other"] }
 * from-path = { path = "packages/from-path" }
 * from-git-master = { git = "https://github.com/VBA-tools/VBA-Web.git" }
 * from-git-branch = { git = "https://github.com/VBA-tools/VBA-Web.git", branch = "beta" }
 * from-git-tag = { git = "https://github.com/VBA-tools/VBA-Web.git", tag = "v1.0.0" }
 * from-git-rev = { git = "https://github.com/VBA-tools/VBA-Web.git", rev = "a1b2c3d4" }
 * 
 * [references.Scripting]
 * version = "1.0"
 * guid = "{420B2830-E718-11CF-893D-00A0C9054228}"
 * optional = true
 * 
 * [[targets]]
 * type = "xlsm"
 * path = "targets/xlsm"
 * 
 * [[targets]]
 * name = "custom-name"
 * type = "xlam"
 * path = "targets/xlam"
 * ```
 */
export interface Manifest {
  metadata: {
    name: string;
    version: string;
    authors: string[];
    publish: boolean;
    default_features: string[];
  };
  src: Source[];
  features: Feature[];
  dependencies: Dependency[];
  references: Reference[];
  targets: Target[];
}

export function parseManifest(raw: Buffer): Manifest {
  const parsed = toml.parse(raw.toString());

  const pkg = parsed.package;
  assert.ok(
    pkg,
    '[package] is a required field, with name, version, and authors specified'
  );
  assert.ok(pkg.name, '[package] name is a required field');
  assert.ok(pkg.version, '[package] version is a required field');
  assert.ok(pkg.authors, '[package] authors is a required field');

  const src = parseSrc(parsed.src);
  const { features, default_features } = parseFeatures(parsed.features);
  const dependencies = parseDependencies(parsed.dependencies);
  const references = parseReferences(parsed.references);
  const targets = parseTargets(parsed.targets || [], pkg.name);

  const metadata = {
    name: pkg.name,
    version: pkg.version,
    authors: pkg.authors,
    publish: pkg.publish,
    default_features
  };

  return { metadata, src, features, dependencies, references, targets };
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
