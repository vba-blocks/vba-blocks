import { Config } from '../config';
import { Version, Dependency } from '../manifest';
import { isRegistryDependency } from '../manifest/dependency';
import Manager, { Registration } from '../sources';

export interface Resolution {
  name: string;
  range: string[];
  registered: Registration[];
}
export type ResolutionGraph = Map<string, Resolution>;

export default class Resolver {
  config: Config;
  manager: Manager;
  graph: ResolutionGraph;
  loading: Map<string, Promise<Registration[]>>;

  constructor(config: Config) {
    this.manager = new Manager(config);
    this.graph = new Map();
  }

  async update() {
    await this.manager.update();
  }

  async get(dependency: Dependency): Promise<Resolution> {
    const { name } = dependency;

    if (this.loading.has(name)) await this.loading.get(name);
    let resolution = this.graph.get(name);

    if (!resolution) {
      const loading = this.manager.resolve(dependency);
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

    if (isRegistryDependency(dependency)) {
      resolution.range.push(dependency.version);
    }

    return resolution;
  }

  getRegistration(id: string) {
    const [name, version] = id.split('@', 2);
    const { registered } = this.graph.get(name);
    return registered.find(registration => registration.version === version);
  }

  [Symbol.iterator]() {
    return this.graph.entries();
  }
}
