import { Config } from '../config';
import { Dependency } from '../manifest';
import {
  isRegistryDependency,
  isPathDependency,
  isGitDependency
} from '../manifest/dependency';
import { Registration } from './registration';
import * as registry from './registry-manager';
import * as path from './path-manager';
import * as git from './git-manager';

export { Registration, registry, path, git };
export { getRegistrationId } from './registration';

export default class Manager {
  config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async update() {
    await registry.update(this.config);
  }

  async resolve(dependency: Dependency): Promise<Registration[]> {
    if (isRegistryDependency(dependency)) {
      return registry.resolve(this.config, dependency);
    } else if (isPathDependency(dependency)) {
      return path.resolve(this.config, dependency);
    } else {
      return git.resolve(this.config, dependency);
    }
  }

  async fetch(registration: Registration) {
    // TODO Encode enough info into registration to determine registry, path, or git
  }
}
