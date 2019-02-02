import env from '../env';
import { writeFile, remove, ensureDir } from '../utils/fs';
import { join, dirname } from '../utils/path';
import parallel from '../utils/parallel';
import {
  addSource,
  removeSource,
  addReference,
  removeReference,
  applyChanges
} from '../manifest/patch-manifest';

import { Project } from '../types';
import { Changeset, Component } from './types';
import { Source, Reference } from '../manifest/types';

export default async function applyChangeset(
  project: Project,
  changeset: Changeset,
  options: { __temp__log_patch: boolean } = { __temp__log_patch: true }
) {
  const progress = env.reporter.progress('Updating src files');
  const start = progress.start;
  progress.start = () => {};
  const done = progress.done;
  progress.done = () => {};
  start();

  // Update src directory
  await parallel(
    changeset.components.changed,
    component => writeComponent(component.details.path!, component),
    { progress }
  );

  await parallel(
    changeset.components.added,
    async component => {
      const path = join(project.paths.dir, 'src', component.filename);
      component.details.path = path;

      await writeComponent(path, component);
    },
    { progress }
  );

  await parallel(
    changeset.components.removed,
    async component => {
      await remove(component.details.path!);
    },
    { progress }
  );

  await updateManifest(project, changeset, options);

  done();
}

async function updateManifest(
  project: Project,
  changeset: Changeset,
  options: { __temp__log_patch: boolean } = { __temp__log_patch: true }
) {
  const changes: string[] = [];
  for (const component of changeset.components.added) {
    const source: Source = {
      name: component.name,
      path: join(project.paths.dir, `src/${component.filename}`)
    };
    project.manifest.src.push(source);
    changes.push(addSource(project.manifest, source));
  }
  for (const component of changeset.components.removed) {
    const index = project.manifest.src.findIndex(
      (source: Source) => source.name === component.name
    );
    project.manifest.src.splice(index, 1);
    changes.push(removeSource(project.manifest, component.name));
  }

  for (let reference of changeset.references.added) {
    // Remove "details" from reference
    // TODO maybe details should live on wrapper object
    reference = Object.assign({}, reference, { details: undefined });

    project.manifest.references.push(reference);
    changes.push(addReference(project.manifest, reference));
  }
  for (const reference of changeset.references.removed) {
    const index = project.manifest.references.findIndex(
      (ref: Reference) => ref.name === reference.name
    );
    project.manifest.src.splice(index, 1);
    changes.push(removeReference(project.manifest, reference.name));
  }

  if (options.__temp__log_patch) {
    applyChanges(changes);
  }
}

async function writeComponent(path: string, component: Component) {
  const dir = dirname(path);
  await ensureDir(dir);
  await writeFile(path, component.code);

  if (component.binary_path) {
    await writeFile(join(dir, component.binary_path), component.details.binary);
  }
}
