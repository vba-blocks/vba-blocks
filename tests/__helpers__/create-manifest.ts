import { Manifest, Dependency } from '../../src/manifest';
import { RegistryDependency } from '../../src/manifest/dependency';
import { dir as FIXTURES } from '../__fixtures__';

export default function createManifest(options: any): Manifest {
  const { package: pkg, project, src = [], references = [], dir = FIXTURES } = options;

  const { name = 'testing', version = '0.0.0', authors = [], publish = false, target } =
    pkg || project;
  const dependencies =
    options.dependencies && !Array.isArray(options.dependencies)
      ? toDependencies(options.dependencies)
      : options.dependencies || [];

  return {
    type: pkg ? 'package' : 'project',
    name,
    version,
    metadata: { authors, publish },
    src,
    dependencies,
    references,
    target,
    dir
  };
}

function toDependencies(values: any): Dependency[] {
  const dependencies: RegistryDependency[] = [];
  for (const [name, version] of Object.entries(values)) {
    dependencies.push({
      name,
      version: <string>version,
      registry: 'vba-blocks'
    });
  }

  return dependencies;
}
