import { isRegistryDependency } from '../manifest/dependency';
import { resolve } from '../sources';

import { Config } from '../types';
import { Dependency } from '../manifest/types';
import { Registration } from '../sources/types';
import { DependencyGraph, Resolver as IResolver, Resolution, ResolutionGraph } from './types';

export default class Resolver implements IResolver {
  config: Config;
  graph: ResolutionGraph;
  loading: Map<string, Promise<Registration[]>>;
  preferred: Map<string, Registration>;

  constructor(config: Config) {
    this.config = config;
    this.graph = new Map();
    this.loading = new Map();
    this.preferred = new Map();
  }

  async get(dependency: Dependency): Promise<Resolution> {
    const { name } = dependency;

    if (this.loading.has(name)) await this.loading.get(name);
    let resolution: Resolution | undefined = this.graph.get(name);

    if (!resolution) {
      const loading = resolve(this.config.sources, dependency);
      this.loading.set(name, loading);

      const registered = await loading;
      resolution = {
        name,
        range: [],
        registered
      };

      if (this.preferred.has(name)) {
        resolution.preferred = this.preferred.get(name);
      }

      this.loading.delete(name);
      this.graph.set(name, resolution);
    }

    if (isRegistryDependency(dependency)) {
      resolution.range.push(dependency.version);
    }

    return resolution;
  }

  getRegistration(id: string): Registration | undefined {
    const [name, version] = id.split('@', 2);
    if (!this.graph.has(name)) return;
    const { registered } = this.graph.get(name)!;
    return registered.find(registration => registration.version === version);
  }

  prefer(preferred: DependencyGraph) {
    for (const registration of preferred) {
      this.preferred.set(registration.name, registration);
    }
  }

  [Symbol.iterator]() {
    return this.graph.entries();
  }
}
