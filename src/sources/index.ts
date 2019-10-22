import dedent from '@timhall/dedent/macro';
import { ok } from 'assert';
import { CliError, ErrorCode } from '../errors';
import {
  Dependency,
  isGitDependency,
  isPathDependency,
  isRegistryDependency
} from '../manifest/dependency';
import GitSource from '../professional/sources/git-source';
import PathSource from './path-source';
import { getSourceParts, Registration } from './registration';
import RegistrySource from './registry-source';
import { Source } from './source';

export { RegistrySource, PathSource, GitSource };

export interface Sources {
  registry: { [name: string]: Source };
  git: Source;
  path: Source;
}

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

  throw new CliError(
    ErrorCode.DependencyUnknownSource,
    `No source matches dependency "${(dependency as Dependency).name}".`
  );
}

export async function fetch(sources: Sources, registration: Registration): Promise<string> {
  const { type, value } = getSourceParts(registration.source);

  if (type === 'registry') {
    const source = sources.registry[value];
    ok(source, sourceMisconfiguredRegistry(value));

    return sources.registry[value].fetch(registration);
  } else if (type === 'path') {
    return sources.path.fetch(registration);
  } else if (type === 'git') {
    return sources.git.fetch(registration);
  }

  throw new CliError(
    ErrorCode.SourceNoneMatching,
    dedent`
      No source matches given registration type "${type}"
      (source = "${registration.source}").
    `
  );
}

function sourceMisconfiguredRegistry(registry: string) {
  return new CliError(
    ErrorCode.SourceMisconfiguredRegistry,
    `No matching registry configured for "${registry}".`
  );
}
