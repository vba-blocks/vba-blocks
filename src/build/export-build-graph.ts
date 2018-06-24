import dedent from 'dedent';
import { join, relative } from 'path';
import { Manifest, Source } from '../manifest';
import { Project } from '../project';
import { BuildGraph } from './build-graph';
import { diffBuildGraph, Changeset } from './diff-build-graph';
import { parallel, writeFile, remove, unixPath } from '../utils';
import env from '../env';
import { Component } from './component';

export default async function exportBuildGraph(
  project: Project,
  dependencies: Manifest[],
  graph: BuildGraph
) {
  const changeset = diffBuildGraph(project, dependencies, graph);
  const operations: string[] = [];

  // TODO update name in manifest

  await parallel(changeset.components.existing, writeComponent, {
    progress: env.reporter.progress('Update src')
  });

  await parallel(
    changeset.components.added,
    async component => {
      await writeComponent(component);

      operations.push(addSrc(project.manifest, component));
    },
    {
      progress: env.reporter.progress('Add src')
    }
  );

  await parallel(
    changeset.components.removed,
    async source => {
      await remove(source.path);

      operations.push(removeSrc(project.manifest, source));
    },
    {
      progress: env.reporter.progress('Remove src')
    }
  );

  for (const reference of changeset.references.existing) {
    // TODO update manifest
  }
  for (const reference of changeset.references.added) {
    // TODO add to manifest
  }
  for (const reference of changeset.references.removed) {
    // TODO remove from manifest
  }

  if (operations.length) {
    const type = project.manifest.package ? 'package' : 'project';
    console.log(
      `The following changes are required in this ${type}'s vba-block.toml:`
    );
    for (const operation of operations) {
      console.log(`\n${operation}`);
    }
  }
}

async function writeComponent(component: Component) {
  const source = component.metadata.source!;
  await writeFile(source.path, component.code);

  if (component.binary_path) {
    await writeFile(component.binary_path, component.binary);
  }
}

function addSrc(manifest: Manifest, component: Component): string {
  const source = component.metadata.source!;
  const relative_path = unixPath(relative(manifest.dir, source.path));
  const binary_path =
    component.binary_path &&
    unixPath(
      relative(manifest.dir, join(manifest.dir, 'src', component.binary_path))
    );
  const details = binary_path
    ? `{ path = ${relative_path}", binary = "${binary_path}" }`
    : `"${relative_path}"`;

  return dedent`
    Add the following to the [src] section:
    ${component.name} = ${details}`;
}

function removeSrc(manifest: Manifest, source: Source): string {
  return `Remove \`${source.name}\` from the [src] section`;
}
