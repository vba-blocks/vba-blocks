import dedent from 'dedent/macro';
import { join, normalize, relative } from '../utils/path';
import { parse as parseToml, convert as convertToToml, patch as patchToml } from '../utils/toml';
import { pathExists, readFile, writeFile } from '../utils/fs';
import { parseSrc } from './source';
import { parseDependencies, isRegistryDependency, isPathDependency } from './dependency';
import { parseReferences } from './reference';
import { parseTarget } from './target';
import { CliError, ErrorCode, manifestOk } from '../errors';

import { Target, Manifest, ManifestType } from './types';

/**
 * @example
 * ```toml
 * [package]
 * name = "package-name"
 * version = "1.0.0"
 * authors = ["Tim Hall <tim.hall.engr@gmail.com> (https://github.com/timhall)"]
 *
 * [src]
 * A = "src/a.bas"
 * B = { path = "src/b.cls" }
 *
 * [dependencies]
 * dictionary = "^1"
 * from-path = { path = "packages/from-path" }
 * ```
 */

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

  const defaults = [];
  let type: ManifestType,
    name: string,
    version: string,
    authors: string[],
    publish: boolean,
    target: Target | undefined;
  if (value.project) {
    type = 'project';
    name = value.project.name;
    version = value.project.version || '0.0.0';
    authors = value.project.authors || [];
    publish = false;

    manifestOk(name, `[project] name is a required field. \n\n${EXAMPLE}`);
    manifestOk(value.project.target, `[project] target is a required field. \n\n${EXAMPLE}`);

    // Store defaults to distinguish from user-set values
    if (!value.project.version) defaults.push('version');
    if (!value.project.authors) defaults.push('authors');
    defaults.push('publish');

    target = parseTarget(value.project.target, name, dir);
  } else {
    type = 'package';
    name = value.package.name;
    version = value.package.version;
    authors = value.package.authors;
    publish = value.package.publish || false;

    manifestOk(name, `[package] name is a required field. \n\n${EXAMPLE}`);
    manifestOk(version, `[package] version is a required field. \n\n${EXAMPLE}`);
    manifestOk(authors, `[package] authors is a required field. \n\n${EXAMPLE}`);

    if (!('publish' in value.package)) defaults.push('publish');

    target = value.package.target && parseTarget(value.package.target, name, dir);
  }

  const src = parseSrc(value.src || {}, dir);
  const dependencies = parseDependencies(value.dependencies || {}, dir);
  const references = parseReferences(value.references || {});

  return {
    type,
    name,
    version,
    metadata: { authors, publish, __temp_defaults: defaults },
    src,
    dependencies,
    references,
    target,
    dir
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
        or "cd YOUR_PROJECTs_DIRECTORY" to change to a folder that contains an existing project.
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
  const value = manifestToValue(manifest);
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

function manifestToValue(manifest: Manifest): any {
  const {
    type,
    name,
    version,
    metadata: { authors, publish, __temp_defaults: defaults = [], ...metadata }
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
    let { name, path, optional } = source;
    path = relative(manifest.dir, path);
    value.src[name] = optional ? { path, optional } : path;
  });

  if (manifest.target) {
    let { name, type: target_type, path } = manifest.target;
    path = relative(manifest.dir, path);

    let target: string | { type: string; name?: string; path?: string };
    if (name !== manifest.name || path !== 'target') {
      target = { type: target_type };
      if (name !== manifest.name) target.name = name;
      if (path !== 'target') target.path = path;
    } else {
      target = target_type;
    }

    value[type].target = target;
  }

  if (manifest.dependencies.length) {
    value.dependencies = {};
    manifest.dependencies.forEach(dependency => {
      if (isRegistryDependency(dependency)) {
        const { name, registry, version } = dependency;
        value.dependencies[name] = registry ? { version, registry } : version;
      } else if (isPathDependency(dependency)) {
        const { name, path } = dependency;
        value.dependencies[name] = path;
      } else {
        const { name, git, tag, branch, rev } = dependency;
        value.dependencies[name] = { name, git };
        if (tag) value.dependencies[name].tag = tag;
        if (branch) value.dependencies[name].branch = branch;
        if (rev) value.dependencies[name].rev = rev;
      }
    });
  }
  if (manifest.references.length) {
    value.references = {};
    manifest.references.forEach(reference => {
      const { name, version, guid, optional } = reference;
      value.references[name] = optional ? { version, guid, optional } : { version, guid };
    });
  }

  return value;
}
