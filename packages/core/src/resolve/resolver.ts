import { Config } from '../config';
import { Version, Dependency } from '../manifest';
import {
  isRegistryDependency,
  isPathDependency,
  isGitDependency
} from '../manifest/dependency';
import { Registration, registry, path, git } from '../manager';

export interface Resolution {
  name: string;
  range: string[];
  registered: Registration[];
}
export type ResolutionGraph = Map<string, Resolution>;

export default class Resolver {
  config: Config;
  graph: ResolutionGraph;
  loading: Map<string, Promise<Registration[]>>;

  constructor(config: Config) {
    this.graph = new Map();
  }

  async get(dependency: Dependency): Promise<Resolution> {
    const { name } = dependency;

    if (this.loading.has(name)) await this.loading.get(name);
    let resolution = this.graph.get(name);

    if (!resolution) {
      let loading;
      if (isRegistryDependency(dependency)) {
        loading = registry.resolve(this.config, dependency);
      } else if (isPathDependency(dependency)) {
        loading = path.resolve(this.config, dependency);
      } else {
        loading = git.resolve(this.config, dependency);
      }

      this.loading.set(name, loading);

      const registered = await loading;
      const resolution = {
        name,
        range: [],
        registered
      };

      this.loading.delete(name);
      this.graph.set(name, resolution);
    }

    let rangeInfo;
    if (isRegistryDependency(dependency)) {
      rangeInfo = dependency.version;
    } else if (isPathDependency(dependency)) {
      rangeInfo = dependency.path;
    } else {
      const { git, branch, tag, rev } = dependency;
      rangeInfo = { git, branch, tag, rev };
    }
    resolution.range.push(rangeInfo);

    return resolution;
  }

  getRegistration(id: string) {
    const [name, version] = id.split('@');
    const { registered } = this.graph.get(name);
    return registered.find(registration => registration.version === version);
  }

  [Symbol.iterator]() {
    return this.graph.entries();
  }
}
