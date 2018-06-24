import { Manifest } from '../manifest';
import { Project } from '../project';
import { BuildGraph } from './build-graph';
import { diffBuildGraph, Changeset } from './diff-build-graph';
import { parallel, writeFile, remove } from '../utils';
import env from '../env';
import { Component } from './component';

export default async function exportBuildGraph(
  project: Project,
  dependencies: Manifest[],
  graph: BuildGraph
) {
  const changeset = diffBuildGraph(project, dependencies, graph);

  // TODO update name in manifest

  await parallel(changeset.components.existing, writeComponent, {
    progress: env.reporter.progress('Update src')
  });

  await parallel(
    changeset.components.added,
    async component => {
      await writeComponent(component);

      // TODO add to manifest
    },
    {
      progress: env.reporter.progress('Add src')
    }
  );

  await parallel(
    changeset.components.removed,
    async source => {
      await remove(source.path);

      // TODO remove from manifest
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
}

async function writeComponent(component: Component) {
  const source = component.metadata.source!;
  await writeFile(source.path, component.code);

  if (component.binary_path) {
    await writeFile(component.binary_path, component.binary);
  }
}
