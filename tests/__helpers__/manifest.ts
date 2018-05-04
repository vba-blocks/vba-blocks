import { join } from 'path';
import { Manifest, Dependency } from '../../src/manifest';
import { dir as FIXTURES } from '@vba-blocks/fixtures';

export function createManifest(options: any): Manifest {
  const {
    package: pkg,
    project,
    src = [],
    references = [],
    targets = [],
    defaultFeatures = [],
    features = [],
    dir = FIXTURES
  } = options;

  const { name = 'testing', version = '0.0.0', authors = [], publish = false } =
    pkg || project;
  const dependencies =
    options.dependencies && !Array.isArray(options.dependencies)
      ? toDependencies(options.dependencies)
      : options.dependencies || [];

  return {
    name,
    version,
    package: pkg && { name, version, authors, publish },
    project: project && { name, version, authors, publish },
    src,
    features,
    defaultFeatures,
    dependencies,
    references,
    targets,
    dir
  };
}

function toDependencies(values): Dependency[] {
  const dependencies = [];
  for (const [name, version] of Object.entries(values)) {
    dependencies.push({
      name,
      version,
      registry: 'vba-blocks'
    });
  }

  return dependencies;
}
