import { join, basename, extname, relative, dirname } from 'path';
import walk from 'walk-sync';
import { Manifest, Target, Source, Reference, Dependency } from '../manifest';
import { Project } from '../project';
import {
  without,
  pathExists,
  readJson,
  copyFile as _copyFile,
  unixJoin,
  unixPath,
  remove,
  ensureDir
} from '../utils';
import { ProjectInfo } from './build-target';

export default async function exportTarget(
  target: Target,
  info: ProjectInfo,
  staging: string
) {
  const { project, dependencies } = info;

  // Load src and references from staging
  const files = without(
    walk(staging, { directories: false }),
    'references.json'
  );
  const references = await readReferences(staging);

  // Extract export graph from manifest, target, and files/references
  const graph = await createExportGraph(
    project,
    dependencies,
    target,
    files,
    references
  );

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
    operations.push(addSrc(project.manifest, source));
  }
  for (const source of graph.src.removed) {
    actions.push(remove(source.path));
    operations.push(removeSrc(project.manifest, source));
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
      console.log(operation);
    }
  }

  await remove(staging);
}

async function copyFile(src: string, dest: string) {
  await ensureDir(dirname(dest));
  await _copyFile(src, dest);
}

interface ExportGraph {
  src: {
    existing: Map<string, Source>;
    added: Set<string>;
    removed: Set<Source>;
  };
  references: {
    existing: Set<Reference>;
    added: Set<Reference>;
    removed: Set<Reference>;
  };
}

interface Details {
  src: Map<string, Source>;
  references: Set<Reference>;
}

async function createExportGraph(
  project: Project,
  dependencies: Manifest[],
  target: Target,
  files: string[],
  exported_references: Reference[]
): Promise<ExportGraph> {
  const src = {
    existing: new Map(),
    added: new Set(),
    removed: new Set()
  };
  const references = {
    existing: new Set(),
    added: new Set(),
    removed: new Set()
  };

  const manifests = [project.manifest, ...dependencies];

  // Load src and references
  //
  // 1. Sort based on from project/package or dependencies
  // 2. Check if source file is in exported files
  // 3. Find added files / references
  const from_project: Details = { src: new Map(), references: new Set() };
  const from_dependencies: Details = { src: new Map(), references: new Set() };

  for (const manifest of manifests) {
    const is_from_project = manifest === project.manifest;
    for (const source of manifest.src) {
      const name = basename(source.path);
      if (is_from_project) {
        if (!files.includes(name)) {
          src.removed.add(source);
        } else {
          from_project.src.set(name, source);
        }
      } else {
        from_dependencies.src.set(name, source);
      }
    }
    for (const reference of manifest.references) {
      if (is_from_project) {
        if (!exported_references.includes(reference)) {
          references.removed.add(reference);
        } else {
          from_project.references.add(reference);
        }
      } else {
        from_dependencies.references.add(reference);
      }
    }
  }

  for (const file of files) {
    if (from_dependencies.src.has(file)) {
      continue;
    } else if (from_project.src.has(file)) {
      src.existing.set(file, from_project.src.get(file));
    } else {
      src.added.add(file);
    }
  }
  for (const reference of exported_references) {
    if (from_dependencies.references.has(reference)) {
      continue;
    } else if (from_project.references.has(reference)) {
      references.existing.add(reference);
    } else {
      references.added.add(reference);
    }
  }

  return {
    src,
    references
  };
}

async function readReferences(staging: string): Promise<Reference[]> {
  const path = join(staging, 'references.json');
  if (!(await pathExists(path))) return [];

  return await readJson(path);
}

function addSrc(manifest: Manifest, source: Source): string {
  const relative_path = unixPath(relative(manifest.dir, source.path));
  return `Add \`${source.name} = "${relative_path}"\` to the [src] section`;
}

function removeSrc(manifest: Manifest, source: Source): string {
  return `Remove \`${source.name}\` from the [src] section`;
}
