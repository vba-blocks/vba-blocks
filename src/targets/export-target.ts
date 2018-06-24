import { join, basename, extname, relative, dirname } from 'path';
import dedent from 'dedent';
import walk from 'walk-sync';
import { Manifest, Target, Source } from '../manifest';
import { Project } from '../project';
import {
  copy,
  unixJoin,
  unixPath,
  remove,
  ensureDir,
  unzip,
  pathExists
} from '../utils';
import { ProjectInfo } from './build-target';
import { Binary, createExportGraph, getName } from '../build/export-graph';

const default_project_name = 'VBAProject';

export default async function exportTarget(
  target: Target,
  info: ProjectInfo,
  staging: string
) {
  const { project, dependencies } = info;

  // Extract target to staging directory
  await extractTarget(project, target, staging);

  // Extract export graph from manifest, target, and files/references
  const graph = await createExportGraph(project, dependencies, target, staging);

  const actions: Promise<void>[] = [];
  const operations: string[] = [];

  // Update target
  await remove(target.path);
  await copy(graph.target, target.path);

  // Update name
  // TODO

  // Update src
  for (const [file, source] of graph.src.existing) {
    actions.push(copyFile(join(staging, file), source.path));
  }
  for (const file of graph.src.added) {
    const name = basename(file, extname(file));
    const path = unixJoin(project.manifest.dir, 'src', file);
    const source: Source = { name, path };

    actions.push(copyFile(join(staging, file), path));
    operations.push(
      addSrc(project.manifest, source, graph.binaries.added.get(source.name))
    );
  }
  for (const source of graph.src.removed) {
    actions.push(remove(source.path));
    operations.push(removeSrc(project.manifest, source));
  }

  // Update binaries
  for (const [file, binary] of graph.binaries.existing) {
    const source = project.manifest.src.find(
      source => source.name === binary.source.name
    )!;
    actions.push(copyFile(join(staging, file), source.binary!));
  }
  for (const [source_name, file] of graph.binaries.added) {
    const path = unixJoin(project.manifest.dir, 'src', file);
    actions.push(copyFile(join(staging, file), path));

    const source_added = Array.from(graph.src.added).some(
      source_path => getName(source_path) === source_name
    );
    if (!source_added) {
      operations.push(addBinary(project.manifest, source_name, path));
    }
  }
  for (const binary of graph.binaries.removed) {
    actions.push(remove(binary.path));

    if (!graph.src.removed.has(binary.source)) {
      operations.push(removeBinary(project.manifest, binary));
    }
  }

  // Update references
  for (const reference of graph.references.existing) {
    // TODO
  }
  for (const reference of graph.references.added) {
    // TODO
  }
  for (const reference of graph.references.removed) {
    // TODO
  }

  await Promise.all(actions);

  if (operations.length) {
    const type = project.manifest.package ? 'package' : 'project';
    console.log(
      `The following changes are required in this ${type}'s vba-block.toml:`
    );
    for (const operation of operations) {
      console.log(`\n${operation}`);
    }
  }

  await remove(staging);
}

export async function extractTarget(
  project: Project,
  target: Target,
  staging: string
) {
  const src = join(project.paths.build, target.filename);
  const dest = join(staging, 'targets', target.type);

  if (!(await pathExists(src))) {
    throw new Error(
      `Could not find built target for type "${
        target.type
      }".\n(checked "${src}")`
    );
  }

  await ensureDir(dest);
  await unzip(src, dest);

  // Remove compiled VBA from dest
  const extracted = walk(dest, { directories: false });
  const compiled = extracted
    .filter(file => extname(file) === '.bin')
    .map(file => join(dest, file));

  await Promise.all(compiled.map(async file => await remove(file)));
}

async function copyFile(src: string, dest: string) {
  await ensureDir(dirname(dest));
  await copy(src, dest);
}

//
// Operations
//

function addSrc(manifest: Manifest, source: Source, binary?: string): string {
  const relative_path = unixPath(relative(manifest.dir, source.path));
  const binary_path =
    binary &&
    unixPath(relative(manifest.dir, join(manifest.dir, 'src', binary)));
  const details = binary
    ? `{ path = "${relative_path}", binary = "${binary_path}" }`
    : `"${relative_path}"`;

  return dedent`
    Add the following to the [src] section:
    ${source.name} = ${details}`;
}

function removeSrc(manifest: Manifest, source: Source): string {
  return `Remove \`${source.name}\` from the [src] section`;
}

function addBinary(manifest: Manifest, source: string, binary: string): string {
  const relative_path = unixPath(relative(manifest.dir, binary));
  return dedent`
    Add the following to "${source}" in src:
    binary = ${relative_path}
    
    Example:

    a = "src/a.frm"
    # becomes
    a = { path = "src/a.frm", binary = "src/a.frx" }`;
}

function removeBinary(manifest: Manifest, binary: Binary): string {
  return `Remove \`binary = ${binary.path}\` from "${
    binary.source.name
  }" in src`;
}
