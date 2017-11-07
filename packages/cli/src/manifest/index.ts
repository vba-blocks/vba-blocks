import { join } from 'path';
import { ok } from 'assert';
import { parse as parseToml } from 'toml';
import { pathExists, readFile } from '../utils/fs';
import { Version } from './version';
import { Source, parseSrc } from './source';
import { Feature, parseFeatures } from './feature';
import { Dependency, parseDependencies } from './dependency';
import { Reference, parseReferences } from './reference';
import { Target, parseTargets } from './target';

export { Version, Source, Feature, Dependency, Reference, Target };

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

export interface Snapshot {
  name: string;
  version: Version;
  dependencies: Dependency[];
}

export interface Metadata {
  authors: string[];
  publish: boolean;
  [name: string]: any;
}

export interface Manifest extends Snapshot {
  metadata: Metadata;
  src: Source[];
  references: Reference[];
  targets: Target[];
  features: Feature[];
  defaultFeatures: string[];
  dir: string;
}

const EXAMPLE = `Example vba-block.toml:

  [package]
  name = "my-package"
  version = "0.0.0"
  authors = ["..."]`;

export function parseManifest(value: any, dir: string): Manifest {
  ok(
    value && value.package,
    `[package] is a required field, with name, version, and authors specified. ${EXAMPLE}`
  );

  const { name, version, authors, publish = false } = value.package;

  ok(name, `[package] name is a required field. ${EXAMPLE}`);
  ok(version, `[package] version is a required field. ${EXAMPLE}`);
  ok(authors, `[package] authors is a required field. ${EXAMPLE}`);

  const src = parseSrc(value.src || {}, dir);
  const { features, defaultFeatures } = parseFeatures(value.features || {});
  const dependencies = parseDependencies(value.dependencies || {});
  const references = parseReferences(value.references || {});
  const targets = parseTargets(value.targets || [], name, dir);

  const metadata = { publish, ...value.package };

  return {
    name,
    version,
    metadata,
    src,
    features,
    defaultFeatures,
    dependencies,
    references,
    targets,
    dir
  };
}

export async function loadManifest(dir: string): Promise<Manifest> {
  const file = join(dir, 'vba-block.toml');
  if (!await pathExists(file)) {
    throw new Error(`vba-blocks.toml not found in "${dir}"`);
  }

  const raw = await readFile(file);
  const parsed = parseToml(raw.toString());
  const manifest = parseManifest(parsed, dir);

  return manifest;
}
