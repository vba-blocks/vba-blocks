import { join, normalize, relative } from '../utils/path';
import { parse as parseToml, convert as convertToToml } from '../utils/toml';
import { pathExists, readFile, writeFile } from '../utils/fs';
import { manifestNotFound } from '../errors';
import { parseSrc } from './source';
import { parseDependencies } from './dependency';
import { parseReferences } from './reference';
import { parseTarget } from './target';
import { manifestOk, manifestInvalid } from '../errors';
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
export function parseManifest(value, dir) {
    manifestOk(value && (value.package || value.project), `A [package] or [project] section is required. \n\n${EXAMPLE}`);
    const defaults = [];
    let type, name, version, authors, publish, target;
    if (value.project) {
        type = 'project';
        name = value.project.name;
        version = value.project.version || '0.0.0';
        authors = value.project.authors || [];
        publish = false;
        manifestOk(name, `[project] name is a required field. \n\n${EXAMPLE}`);
        manifestOk(value.project.target, `[project] target is a required field. \n\n${EXAMPLE}`);
        // Store defaults to distinguish from user-set values
        if (!value.project.version)
            defaults.push('version');
        if (!value.project.authors)
            defaults.push('authors');
        defaults.push('publish');
        target = parseTarget(value.project.target, name, dir);
    }
    else {
        type = 'package';
        name = value.package.name;
        version = value.package.version;
        authors = value.package.authors;
        publish = value.package.publish || false;
        manifestOk(name, `[package] name is a required field. \n\n${EXAMPLE}`);
        manifestOk(version, `[package] version is a required field. \n\n${EXAMPLE}`);
        manifestOk(authors, `[package] authors is a required field. \n\n${EXAMPLE}`);
        if (!('publish' in value.package))
            defaults.push('publish');
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
export async function loadManifest(dir) {
    const file = join(dir, 'vba-block.toml');
    if (!(await pathExists(file))) {
        throw manifestNotFound(dir);
    }
    const raw = await readFile(file);
    let parsed;
    try {
        parsed = await parseToml(raw.toString());
    }
    catch (err) {
        const message = `Syntax Error: ${file} (${err.line}:${err.column})\n\n${err.message}`;
        throw manifestInvalid(message);
    }
    const manifest = parseManifest(parsed, normalize(dir));
    return manifest;
}
export async function writeManifest(manifest, dir) {
    const { type, name, version, metadata: { authors, publish, __temp_defaults: defaults = [], ...metadata } } = manifest;
    const values = { name };
    if (!defaults.includes('version'))
        values.version = version;
    if (!defaults.includes('authors'))
        values.authors = authors;
    if (!defaults.includes('publish'))
        values.publish = publish;
    Object.assign(values, metadata);
    const value = {
        [type]: values
    };
    value.src = {};
    manifest.src.forEach(source => {
        let { path, optional } = source;
        path = relative(manifest.dir, path);
        value.src[source.name] = optional ? { path, optional } : path;
    });
    if (manifest.target) {
        let { name, type: target_type, path } = manifest.target;
        path = relative(manifest.dir, path);
        let target;
        if (name !== manifest.name || path !== 'target') {
            target = { type: target_type };
            if (name !== manifest.name)
                target.name = name;
            if (path !== 'target')
                target.path = path;
        }
        else {
            target = target_type;
        }
        value[type].target = target;
    }
    // TODO dependencies and references
    if (manifest.dependencies.length) {
        throw new Error(`writeManifest does not currently support dependencies`);
    }
    if (manifest.references.length) {
        throw new Error(`writeManifest does not currently support references`);
    }
    const toml = await convertToToml(value);
    await writeFile(join(dir, 'vba-block.toml'), toml + '\n');
}
