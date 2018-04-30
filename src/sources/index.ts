import { ok } from 'assert';
import {
  Dependency,
  isRegistryDependency,
  isPathDependency,
  isGitDependency
} from '../manifest/dependency';
import { Registration, getSourceParts } from './registration';
import { Source } from './source';
import RegistrySource from './registry-source';
import PathSource from './path-source';
import GitSource from '../professional/sources/git-source';

export { Registration, Source, RegistrySource, PathSource, GitSource };

export interface Sources {
  registry: { [name: string]: Source };
  git: Source;
  path: Source;
}

export async function resolve(
  sources: Sources,
  dependency: Dependency
): Promise<Registration[]> {
  if (isRegistryDependency(dependency)) {
    const { registry } = dependency;
    const source = sources.registry[registry];
    ok(source, `No matching registry configured for "${registry}"`);

    return source.resolve(dependency);
  } else if (isPathDependency(dependency)) {
    return sources.path.resolve(dependency);
  } else if (isGitDependency(dependency)) {
    return sources.git.resolve(dependency);
  }

  throw new Error('No source matches given dependency');
}

export async function fetch(
  sources: Sources,
  registration: Registration
): Promise<string> {
  const { type, value, details } = getSourceParts(registration.source);

  if (type === 'registry') {
    const source = sources.registry[value];
    ok(source, `No matching registry configured for "${value}"`);

    return sources.registry[value].fetch(registration);
  } else if (type === 'path') {
    return sources.path.fetch(registration);
  } else if (type === 'git') {
    return sources.git.fetch(registration);
  }

  throw new Error(
    `No source matches given registration type "${type}" (source = "${
      registration.source
    }")`
  );
}
