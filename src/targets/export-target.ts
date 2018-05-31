import { join, basename, extname, relative, dirname } from 'path';
import dedent from 'dedent';
import { Manifest, Target, Source } from '../manifest';
import {
  copyFile as _copyFile,
  unixJoin,
  unixPath,
  remove,
  ensureDir
} from '../utils';
import { ProjectInfo } from './build-target';
import { Binary, createExportGraph, getName } from './export-graph';

const default_project_name = 'VBAProject';

export default async function exportTarget(
  target: Target,
  info: ProjectInfo,
  staging: string
) {
  const { project, dependencies } = info;

  // Extract export graph from manifest, target, and files/references
  const graph = await createExportGraph(project, dependencies, target, staging);

  // Update name
  // TODO

  // Update src
  const actions: Promise<void>[] = [];
  const operations: string[] = [];

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

async function copyFile(src: string, dest: string) {
  await ensureDir(dirname(dest));
  await _copyFile(src, dest);
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
