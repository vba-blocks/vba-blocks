import dedent from 'dedent/macro';
import { CliError, ErrorCode, manifestOk } from '../errors';
import { pathExists, readFile, writeFile } from '../utils/fs';
import { join, normalize } from '../utils/path';
import { convert as convertToToml, parse as parseToml, patch as patchToml } from '../utils/toml';
import { Dependency, formatDependencies, parseDependencies } from './dependency';
import { formatReferences, parseReferences, Reference } from './reference';
import { formatSrc, parseSrc, Source } from './source';
import { formatTarget, parseTarget, Target } from './target';
import { DEFAULT_VERSION, Version } from './version';

/**
 * Snapshot is the minimal manifest needed to support both Manifest
 * and info loaded during dependency resolution
 */
export interface Snapshot {
  name: string;
  version: Version;
  dependencies: Dependency[];
}

export type ManifestType = 'package' | 'project';

/*
  # Manifest

  The parsed vba-block.toml manifest.
  package/project, src, dependencies, etc are all parsed and put in a consistent form

  ```toml
  [package]
  name = "package-name"
  version = "1.0.0"
  authors = ["Tim Hall <tim.hall.engr@gmail.com> (https://github.com/timhall)"]

  [src]
  A = "src/a.bas"
  B = { path = "src/b.cls" }

  [dependencies]
  dictionary = "^1"
  from-path = { path = "packages/from-path" }
```
*/
export interface Metadata {
  authors?: string[];
  publish?: boolean;
  [name: string]: any;
}

export interface Manifest extends Snapshot {
  type: ManifestType;
  metadata: Metadata;
  src: Source[];
  references: Reference[];
  devSrc: Source[];
  devDependencies: Dependency[];
  devReferences: Reference[];
  target?: Target;
}

const EXAMPLE = `Example vba-block.toml for a package (e.g. library to be shared):

  [package]
  name = "my-package"
  version = "0.0.0"
  authors = ["..."]

Example vba-block.toml for a project (e.g. workbook, document, etc.):

  [project]
  name = "my-project"
  target = "xlsm"`;

export function parseManifest(value: any, dir: string): Manifest {
  manifestOk(
    value && (value.package || value.project),
    `A [package] or [project] section is required. \n\n${EXAMPLE}`
  );

  let type: ManifestType;
  let name: string;
  let version: string;
  let authors: string[] | undefined;
  let publish: boolean | undefined;
  let target: Target | undefined;

  if (value.project) {
    type = 'project';
    name = value.project.name;
    version = value.project.version || DEFAULT_VERSION;
    authors = value.project.authors;

    manifestOk(name, `[project] name is a required field. \n\n${EXAMPLE}`);
    manifestOk(value.project.target, `[project] target is a required field. \n\n${EXAMPLE}`);

    target = parseTarget(value.project.target, name, dir);
  } else {
    type = 'package';
    name = value.package.name;
    version = value.package.version;
    authors = value.package.authors;
    publish = value.package.publish;

    manifestOk(name, `[package] name is a required field. \n\n${EXAMPLE}`);
    manifestOk(version, `[package] version is a required field. \n\n${EXAMPLE}`);
    manifestOk(authors, `[package] authors is a required field. \n\n${EXAMPLE}`);

    target = value.package.target && parseTarget(value.package.target, name, dir);
  }

  const src = parseSrc(value.src || {}, dir);
  const dependencies = parseDependencies(value.dependencies || {}, dir);
  const references = parseReferences(value.references || {});

  const devSrc = parseSrc(value['dev-src'] || {}, dir);
  const devDependencies = parseDependencies(value['dev-dependencies'] || {}, dir);
  const devReferences = parseReferences(value['dev-references'] || {});

  return {
    type,
    name,
    version,
    metadata: { authors, publish },
    src,
    dependencies,
    references,
    devSrc,
    devDependencies,
    devReferences,
    target
  };
}

export async function loadManifest(dir: string): Promise<Manifest> {
  const file = join(dir, 'vba-block.toml');

  if (!(await pathExists(file))) {
    throw new CliError(
      ErrorCode.ManifestNotFound,
      dedent`
        vba-blocks.toml not found in "${dir}".

        Try "vba-blocks init" to start a new project in this directory
        or "cd YOUR_PROJECTS_DIRECTORY" to change to a folder that contains an existing project.
      `
    );
  }

  const raw = await readFile(file);

  let parsed;
  try {
    parsed = await parseToml(raw.toString());
  } catch (err) {
    throw new CliError(
      ErrorCode.ManifestInvalid,
      dedent`
        vba-blocks.toml is invalid:

        Syntax Error: ${file} (${err.line}:${err.column})\n\n${err.message}
      `
    );
  }

  const manifest = parseManifest(parsed, normalize(dir));

  return manifest;
}

export async function writeManifest(manifest: Manifest, dir: string) {
  const value = formatManifest(manifest, dir);
  const path = join(dir, 'vba-block.toml');
  let toml: string;

  if (await pathExists(path)) {
    const existing = await readFile(path, 'utf8');
    toml = await patchToml(existing, value);
  } else {
    toml = await convertToToml(value);
  }

  await writeFile(path, toml);
}

export function formatManifest(manifest: Manifest, dir: string): object {
  const {
    type,
    name,
    version,
    metadata: { authors, publish, ...metadata }
  } = manifest;

  const values: any = { name };
  if (version !== DEFAULT_VERSION) values.version = version;
  if (authors != null) values.authors = authors;
  if (publish != null) values.publish = publish;
  Object.assign(values, metadata);

  const value: any = {
    [type]: values
  };

  if (manifest.target) {
    value[type].target = formatTarget(manifest.target, manifest.name, dir);
  }

  value.src = formatSrc(manifest.src, dir);

  if (manifest.dependencies.length) {
    value.dependencies = formatDependencies(manifest.dependencies);
  }
  if (manifest.references.length) {
    value.references = formatReferences(manifest.references);
  }

  if (manifest.devSrc.length) {
    value['dev-src'] = formatSrc(manifest.devSrc, dir);
  }
  if (manifest.devDependencies.length) {
    value['dev-dependencies'] = formatDependencies(manifest.devDependencies);
  }
  if (manifest.devReferences.length) {
    value['dev-references'] = formatReferences(manifest.devReferences);
  }

  return value;
}
