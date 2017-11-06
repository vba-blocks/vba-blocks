import { ok } from 'assert';
import env from '../env';
import { Config } from '../config';
import {
  Dependency,
  isRegistryDependency,
  isPathDependency,
  isGitDependency
} from '../manifest/dependency';
import { Registration } from './registration';
import { Source } from './source';

import RegistrySource from './registry-source';
import path from './path-source';
import git from './git-source';

export { Registration, Source, RegistrySource, path, git };
export {
  getRegistrationId,
  getRegistrationSource,
  toDependency
} from './registration';

const notSupported = (name: 'git' | 'path') => {
  const id = name === 'git' ? 'unsupported-git' : 'unsupported-path';
  return {
    resolve(dependency: Dependency): Registration[] {
      throw env.reporter.error(id);
    },
    fetch(registration: Registration): string {
      throw env.reporter.error(id);
    }
  };
};

export default class SourceManager {
  sources: {
    registry: { [name: string]: Source };
    git: Source;
    path: Source;
  };

  constructor(config: Config) {
    this.sources = {
      registry: {},
      git: config.flags.git ? git : notSupported('git'),
      path: config.flags.path ? path : notSupported('path')
    };

    for (const [name, { index, packages }] of Object.entries(config.registry)) {
      this.sources.registry[name] = new RegistrySource({
        name,
        index,
        packages
      });
    }
  }

  async resolve(dependency: Dependency): Promise<Registration[]> {
    if (isRegistryDependency(dependency)) {
      const { registry } = dependency;
      const source = this.sources.registry[registry];
      ok(source, `No matching registry configured for "${registry}"`);

      return source.resolve(dependency);
    } else if (isPathDependency(dependency)) {
      return this.sources.path.resolve(dependency);
    } else if (isGitDependency(dependency)) {
      return this.sources.git.resolve(dependency);
    }

    throw new Error('No source matches given dependency');
  }

  async fetch(registration: Registration): Promise<string> {
    const [info, details] = registration.source.split('#');
    const [type, value] = info.split('+');

    if (type === 'registry') {
      const source = this.sources.registry[value];
      ok(source, `No matching registry configured for "${value}"`);

      return this.sources.registry[value].fetch(registration);
    } else if (type === 'path') {
      return this.sources.path.fetch(registration);
    } else if (type === 'git') {
      return this.sources.git.fetch(registration);
    }

    throw new Error(
      `No source matches given registration type "${type}" (source = "${registration.source}")`
    );
  }
}
