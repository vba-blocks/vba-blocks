import { basename, extname, join } from 'path';
import walk from 'walk-sync';
import { Project } from '../project';
import { Manifest, Source, Reference, Target } from '../manifest';
import { pathExists, readJson, unixJoin } from '../utils';

const binary_extensions = ['.frx'];

export interface ExportGraph {
  name: string;

  // existing: file -> Source
  // added: file[]
  // removed: Source[]
  src: {
    existing: Map<string, Source>;
    added: Set<string>;
    removed: Set<Source>;
  };

  // existing: file -> Binary
  // added: source name -> file
  // removed: Binary[]
  binaries: {
    existing: Map<string, Binary>;
    added: Map<string, string>;
    removed: Set<Binary>;
  };

  // existing: name -> Reference
  // added: name -> Reference
  // removed: Reference[]
  references: {
    existing: Map<string, Reference>;
    added: Map<string, Reference>;
    removed: Set<Reference>;
  };

  // path[]
  target: string;
}

interface Details {
  // name -> Source, Binary, or Reference
  src: Map<string, Source>;
  binaries: Map<string, Binary>;
  references: Map<string, Reference>;
}

export interface Binary {
  source: Source;
  path: string;
}

export async function createExportGraph(
  project: Project,
  dependencies: Manifest[],
  target: Target,
  staging: string
): Promise<ExportGraph> {
  const src = {
    existing: new Map(),
    added: new Set(),
    removed: new Set()
  };
  const binaries = {
    existing: new Map(),
    added: new Map(),
    removed: new Set()
  };
  const references = {
    existing: new Map(),
    added: new Map(),
    removed: new Set()
  };

  // Load src and references from staging
  const files = walk(staging, { directories: false }).filter(file => {
    return file !== 'project.json' && !file.startsWith('targets');
  });
  const details = await readDetails(staging);

  // Load src, binaries, and references
  //
  // 1. Sort based on from project/package or dependencies
  // 2. Check if source file / binaries / references is in exported
  // 3. Find added files / binaries / references
  const from_project: Details = {
    src: new Map(),
    binaries: new Map(),
    references: new Map()
  };
  const from_dependencies: Details = {
    src: new Map(),
    binaries: new Map(),
    references: new Map()
  };

  const manifests = [project.manifest, ...dependencies];

  for (const manifest of manifests) {
    const is_from_project = manifest === project.manifest;

    for (const source of manifest.src) {
      const source_base = basename(source.path);
      if (is_from_project) {
        if (!files.includes(source_base)) {
          src.removed.add(source);
        } else {
          from_project.src.set(source_base, source);
        }

        if (source.binary) {
          const binary_base = basename(source.binary);
          if (!files.includes(binary_base)) {
            binaries.removed.add({ source, path: source.binary });
          } else {
            from_project.binaries.set(source.name, {
              source,
              path: source.binary
            });
          }
        }
      } else {
        from_dependencies.src.set(source_base, source);

        if (source.binary) {
          from_dependencies.binaries.set(source.name, {
            source,
            path: source.binary
          });
        }
      }
    }

    for (const reference of manifest.references) {
      if (is_from_project) {
        if (!details.references.some(hasReference(reference))) {
          references.removed.add(reference);
        } else {
          from_project.references.set(reference.name, reference);
        }
      } else {
        from_dependencies.references.set(reference.name, reference);
      }
    }
  }

  for (const file of files) {
    if (isBinary(file)) {
      const source_name = getName(file);
      if (from_dependencies.binaries.has(source_name)) {
        continue;
      } else if (from_project.binaries.has(source_name)) {
        binaries.existing.set(file, from_project.binaries.get(source_name));
      } else {
        binaries.added.set(source_name, file);
      }

      continue;
    }

    if (from_dependencies.src.has(file)) {
      continue;
    } else if (from_project.src.has(file)) {
      src.existing.set(file, from_project.src.get(file));
    } else {
      src.added.add(file);
    }
  }

  for (const reference of details.references) {
    if (from_dependencies.references.has(reference.name)) {
      continue;
    } else if (from_project.references.has(reference.name)) {
      references.existing.set(reference.name, reference);
    } else {
      references.added.set(reference.name, reference);
    }
  }

  return {
    name: details.name,
    src,
    binaries,
    references,
    target: unixJoin(staging, 'targets', target.type)
  };
}

interface ProjectDetails {
  name: string;
  references: Reference[];
}

async function readDetails(staging: string): Promise<ProjectDetails> {
  const path = join(staging, 'project.json');
  if (!(await pathExists(path))) return { name: 'VBAProject', references: [] };

  return await readJson(path);
}

function hasReference(reference: Reference): (value: Reference) => boolean {
  return (value: Reference) => value.name === reference.name;
}

function isBinary(file: string): boolean {
  return binary_extensions.includes(extname(file));
}

export function getName(value: string): string {
  return basename(value, extname(value));
}
