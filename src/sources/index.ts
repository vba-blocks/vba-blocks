import { ok } from 'assert';
import { isRegistryDependency, isPathDependency, isGitDependency } from '../manifest/dependency';
import { getSourceParts } from './registration';
import RegistrySource from './registry-source';
import PathSource from './path-source';
import GitSource from '../professional/sources/git-source';
import {
  sourceMisconfiguredRegistry,
  dependencyUnknownSource,
  sourceNoneMatching
} from '../errors';

import { Dependency } from '../manifest/types';
import { Source, Sources, Registration } from './types';

export { RegistrySource, PathSource, GitSource };

export async function resolve(sources: Sources, dependency: Dependency): Promise<Registration[]> {
  if (isRegistryDependency(dependency)) {
    const { registry } = dependency;
    const source = sources.registry[registry];
    ok(source, sourceMisconfiguredRegistry(registry));

    return source.resolve(dependency);
  } else if (isPathDependency(dependency)) {
    return sources.path.resolve(dependency);
  } else if (isGitDependency(dependency)) {
    return sources.git.resolve(dependency);
  }

  throw dependencyUnknownSource((<Dependency>dependency).name);
}

export async function fetch(sources: Sources, registration: Registration): Promise<string> {
  const { type, value, details } = getSourceParts(registration.source);

  if (type === 'registry') {
    const source = sources.registry[value];
    ok(source, sourceMisconfiguredRegistry(value));

    return sources.registry[value].fetch(registration);
  } else if (type === 'path') {
    return sources.path.fetch(registration);
  } else if (type === 'git') {
    return sources.git.fetch(registration);
  }

  throw sourceNoneMatching(type, registration.source);
}
