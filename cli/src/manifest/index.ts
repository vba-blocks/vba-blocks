import { exists, readFile } from 'fs-extra';
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
export interface Metadata {
  name: string;
  version: string;
  authors: string[];
  publish: boolean;
  default_features: string[];
}

export interface Manifest {
  metadata: Metadata;
  src: Source[];
  features: Feature[];
  dependencies: Dependency[];
  references: Reference[];
  targets: Target[];
}

const EXAMPLE = `Example vba-block.toml:

[package]
name = "my-package"
version = "0.0.0"
authors = ["Name <email> (url)"]`;

export function parseManifest(value: any): Manifest {
  assert.ok(
    value && value.package,
    `[package] is a required field, with name, version, and authors specified. ${EXAMPLE}`
  );

  const { name, version, authors, publish = false } = value.package;

  assert.ok(name, `[package] name is a required field. ${EXAMPLE}`);
  assert.ok(version, `[package] version is a required field. ${EXAMPLE}`);
  assert.ok(authors, `[package] authors is a required field. ${EXAMPLE}`);

  const src = parseSrc(value.src || {});
  const { features, default_features } = parseFeatures(value.features || {});
  const dependencies = parseDependencies(value.dependencies || {});
  const references = parseReferences(value.references || {});
  const targets = parseTargets(value.targets || [], name);

  const metadata = {
    name,
    version,
    authors,
    publish,
    default_features
  };

  return { metadata, src, features, dependencies, references, targets };
}

export async function loadManifest(dir: string) {
  const file = join(dir, 'vba-block.toml');
  if (!await exists(file)) {
    throw new Error(`vba-blocks.toml not found in "${dir}"`);
  }

  const raw = await readFile(file);
  const parsed = toml.parse(raw.toString());
  const manifest = parseManifest(parsed);

  return manifest;
}
