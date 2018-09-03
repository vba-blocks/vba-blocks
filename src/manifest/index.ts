import { join, normalize, relative } from '../utils/path';
import { parse as parseToml, convert as convertToToml } from '../utils/toml';
import { pathExists, readFile, writeFile } from '../utils/fs';
import { manifestNotFound } from '../errors';
import { Version } from './version';
import { Source, parseSrc } from './source';
// TODO #features
// import { Feature, parseFeatures } from './feature';
import { Dependency, parseDependencies } from './dependency';
import { Reference, parseReferences } from './reference';
import { Target, parseTargets } from './target';
import { manifestOk, manifestInvalid } from '../errors';

export {
  Version,
  Source,
  // TODO #features
  // Feature,
  Dependency,
  Reference,
  Target
};

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
 * [dependencies]
 * dictionary = "v1.4.1"
 * with-properties = { version = "1.0.0" }
 * from-path = { path = "packages/from-path" }
 * from-git-master = { git = "https://github.com/VBA-tools/VBA-Web.git" }
 * from-git-branch = { git = "https://github.com/VBA-tools/VBA-Web.git", branch = "beta" }
 * from-git-tag = { git = "https://github.com/VBA-tools/VBA-Web.git", tag = "v1.0.0" }
 * from-git-rev = { git = "https://github.com/VBA-tools/VBA-Web.git", rev = "a1b2c3d4" }
 *
 * # [references.Scripting]
 * # version = "1.0"
 * # guid = "{420B2830-E718-11CF-893D-00A0C9054228}"
 *
 * [targets]
 * xlsm = "targets/xlsm"
 *
 * [targets.xlam]
 * name = "custom-name"
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
  defaults?: string[];
  [name: string]: any;
}

export interface Manifest extends Snapshot {
  type: ManifestType;
  metadata: Metadata;
  src: Source[];
  references: Reference[];
  targets: Target[];
  dir: string;

  // TODO #features
  // features: Feature[];
  // defaultFeatures: string[];
}

export type ManifestType = 'package' | 'project';

const EXAMPLE = `Example vba-block.toml for a package (e.g. library to be shared):

  [package]
  name = "my-package"
  version = "0.0.0"
  authors = ["..."]

Example vba-block.toml for a project (e.g. workbook, document, etc.):

  [project]
  name = "my-project"
  version = "0.0.0"
  authors = ["..."]`;

export function parseManifest(value: any, dir: string): Manifest {
  manifestOk(
    value && (value.package || value.project),
    `[package] or [project] is required, with name, version, and authors specified. \n\n${EXAMPLE}`
  );

  const defaults = [];
  let type: ManifestType, name, version, authors, publish;
  if (value.project) {
    type = 'project';
    name = value.project.name;
    version = value.project.version || '0.0.0';
    authors = value.project.authors || [];
    publish = false;

    manifestOk(name, `[project] name is a required field. \n\n${EXAMPLE}`);

    // Store defaults to distinguish from user-set values
    if (!value.project.version) defaults.push('version');
    if (!value.project.authors) defaults.push('authors');
    defaults.push('publish');
  } else {
    type = 'package';
    name = value.package.name;
    version = value.package.version;
    authors = value.package.authors;
    publish = value.package.publish || false;

    manifestOk(name, `[package] name is a required field. \n\n${EXAMPLE}`);
    manifestOk(
      version,
      `[package] version is a required field. \n\n${EXAMPLE}`
    );
    manifestOk(
      authors,
      `[package] authors is a required field. \n\n${EXAMPLE}`
    );

    if (!('publish' in value.package)) defaults.push('publish');
  }

  const src = parseSrc(value.src || {}, dir);
  const dependencies = parseDependencies(value.dependencies || {}, dir);
  const references = parseReferences(value.references || {});
  const targets = parseTargets(value.targets || {}, name, dir);

  // TODO #features
  // const { features, defaultFeatures } = parseFeatures(value.features || {});

  return {
    type,
    name,
    version,
    metadata: { authors, publish, defaults },
    src,
    dependencies,
    references,
    targets,
    dir

    // TODO #features
    // features,
    // defaultFeatures,
  };
}

export async function loadManifest(dir: string): Promise<Manifest> {
  const file = join(dir, 'vba-block.toml');

  if (!(await pathExists(file))) {
    throw manifestNotFound(dir);
  }

  const raw = await readFile(file);

  let parsed;
  try {
    parsed = parseToml(raw.toString());
  } catch (err) {
    const message = `Syntax Error: ${file} (${err.line}:${err.column})\n\n${
      err.message
    }`;
    throw manifestInvalid(message);
  }

  const manifest = parseManifest(parsed, normalize(dir));

  return manifest;
}

export async function writeManifest(manifest: Manifest, dir: string) {
  const {
    type,
    name,
    version,
    metadata: { authors, publish, defaults = [], ...metadata }
  } = manifest;

  const values: any = { name };
  if (!defaults.includes('version')) values.version = version;
  if (!defaults.includes('authors')) values.authors = authors;
  if (!defaults.includes('publish')) values.publish = publish;
  Object.assign(values, metadata);

  const value: any = {
    [type]: values
  };

  value.src = {};
  manifest.src.forEach(source => {
    let { path, optional } = source;
    path = relative(manifest.dir, path);
    value.src[source.name] = optional ? { path, optional } : path;
  });

  value.targets = {};
  manifest.targets.forEach(target => {
    let { name, type, path } = target;
    path = relative(manifest.dir, path);
    value.targets[type] = name !== manifest.name ? { name, path } : path;
  });

  // TODO dependencies and references
  if (manifest.dependencies.length) {
    throw new Error(`writeManifest does not currently support dependencies`);
  }
  if (manifest.references.length) {
    throw new Error(`writeManifest does not currently support references`);
  }

  const toml = convertToToml(value);
  await writeFile(join(dir, 'vba-block.toml'), toml + '\n');
}
