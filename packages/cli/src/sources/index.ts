import env from '../env';
import { Config } from '../config';
import { Dependency } from '../manifest';
import { Registration } from './registration';
import { Source } from './source';
import { parallel } from '../utils';

import registry from './registry-source';
import path from './path-source';
import git from './git-source';

export { Registration, Source, registry, path, git };
export { getRegistrationId, getRegistrationSource } from './registration';

export default class SourceManager {
  config: Config;
  sources: Source[];

  constructor(config: Config, sources?: Source[]) {
    this.config = config;
    this.sources = sources || [registry, path];

    if (!sources && config.flags.git) {
      this.sources.push(git);
    }
  }

  async update() {
    await parallel(
      this.sources,
      (source: Source) => {
        return source.update && source.update(this.config);
      },
      { progress: env.reporter.progress('Update sources') }
    );
  }

  async resolve(dependency: Dependency): Promise<Registration[]> {
    for (const source of this.sources) {
      if (source.match(dependency)) {
        return source.resolve(this.config, dependency);
      }
    }

    throw new Error('No source matches given dependency');
  }

  async fetch(registration: Registration): Promise<string> {
    const [type] = registration.source.split('+', 1);
    for (const source of this.sources) {
      if (source.match(type)) {
        return source.fetch(this.config, registration);
      }
    }

    throw new Error(
      `No source matches given registration type "${type}" (source = "${registration.source}")`
    );
  }

  toDependency(registration: Registration): Dependency {
    const [type] = registration.source.split('+', 1);
    for (const source of this.sources) {
      if (source.match(type)) {
        return source.toDependency(registration);
      }
    }

    throw new Error(
      `No source mantches given registration type "${type}" (source = "${registration.source}")`
    );
  }

  satisfies(value: Dependency, comparison: Dependency): boolean {
    for (const source of this.sources) {
      if (source.match(comparison)) {
        if (!source.match(value)) return false;
        return source.satisfies(value, comparison);
      }
    }

    throw new Error('No source matches given dependency');
  }
}
