import { Config } from '../config';
import { Version, Dependency } from '../manifest';
import { Registration, getRegistered } from '../registry';

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
    const { name, version } = dependency;

    if (this.loading.has(name)) await this.loading.get(name);

    let resolution = this.graph.get(name);

    if (!resolution) {
      const loading = getRegistered(this.config, name);
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

    resolution.range.push(version);

    return resolution;
  }

  [Symbol.iterator]() {
    return this.graph.values();
  }
}
