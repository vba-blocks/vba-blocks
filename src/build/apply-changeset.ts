import env from '../env';
import { writeManifest } from '../manifest';
import { Reference } from '../manifest/reference';
import { Source } from '../manifest/source';
import { Project } from '../project';
import { ensureDir, remove, writeFile } from '../utils/fs';
import parallel from '../utils/parallel';
import { dirname, join } from '../utils/path';
import { Changeset } from './changeset';
import { Component } from './component';

export default async function applyChangeset(project: Project, changeset: Changeset) {
  const progress = env.reporter.progress('Updating src files');
  const start = progress.start;
  const done = progress.done;

  progress.start = () => {};
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

  await updateManifest(project, changeset);

  done();
}

async function updateManifest(project: Project, changeset: Changeset) {
  const changes: string[] = [];
  for (const component of changeset.components.added) {
    const source: Source = {
      name: component.name,
      path: join(project.paths.dir, `src/${component.filename}`)
    };
    project.manifest.src.push(source);
  }
  for (const component of changeset.components.removed) {
    const index = project.manifest.src.findIndex(
      (source: Source) => source.name === component.name
    );
    project.manifest.src.splice(index, 1);
  }

  for (let reference of changeset.references.added) {
    // Remove "details" from reference
    // TODO maybe details should live on wrapper object
    reference = Object.assign({}, reference, { details: undefined });

    project.manifest.references.push(reference);
  }
  for (const reference of changeset.references.removed) {
    const index = project.manifest.references.findIndex(
      (ref: Reference) => ref.name === reference.name
    );
    project.manifest.references.splice(index, 1);
  }

  await writeManifest(project.manifest, project.paths.dir);
}

async function writeComponent(path: string, component: Component) {
  const dir = dirname(path);
  await ensureDir(dir);
  await writeFile(path, component.code);

  if (component.binary_path) {
    await writeFile(join(dir, component.binary_path), component.details.binary);
  }
}
