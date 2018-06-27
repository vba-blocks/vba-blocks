import dedent from 'dedent';
import env from '../env';
import { Project } from '../project';
import { Changeset } from './compare-build-graphs';
import { Component } from './component';
import { Manifest } from '../manifest';
import { writeFile, remove } from '../utils/fs';
import { join, dirname, relative } from '../utils/path';
import parallel from '../utils/parallel';

export default async function applyChangeset(
  project: Project,
  changeset: Changeset
) {
  // Update src directory
  await parallel(
    changeset.components.changed,
    component => writeComponent(component.details.path!, component),
    { progress: env.reporter.progress('Update src') }
  );

  await parallel(
    changeset.components.added,
    async component => {
      const path = join(project.paths.dir, 'src', component.filename);
      component.details.path = path;

      await writeComponent(path, component);
    },
    { progress: env.reporter.progress('Add src') }
  );

  await parallel(
    changeset.components.removed,
    async component => {
      await remove(component.details.path!);
    },
    { progress: env.reporter.progress('Remove src') }
  );

  await updateManifest(project, changeset);
}

async function updateManifest(project: Project, changeset: Changeset) {
  const operations: string[] = [];

  for (const component of changeset.components.added) {
    operations.push(addSrc(project.manifest, component));
  }
  for (const component of changeset.components.removed) {
    operations.push(removeSrc(component));
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

async function writeComponent(path: string, component: Component) {
  await writeFile(path, component.code);

  if (component.binary_path) {
    await writeFile(
      join(dirname(path), component.binary_path),
      component.details.binary
    );
  }
}

function addSrc(manifest: Manifest, component: Component): string {
  const path = component.details.path!;
  const binary_path =
    component.binary_path && join(dirname(path), component.binary_path);

  const relative_path = relative(manifest.dir, path);
  const relative_binary_path =
    binary_path && relative(manifest.dir, binary_path);

  const details = relative_binary_path
    ? `{ path = ${relative_path}", binary = "${relative_binary_path}" }`
    : `"${relative_path}"`;

  return dedent`
    Add the following to the [src] section:
    ${component.name} = ${details}`;
}

function removeSrc(component: Component): string {
  return `Remove \`${component.name}\` from the [src] section`;
}
