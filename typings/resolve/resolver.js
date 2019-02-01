import { isRegistryDependency } from '../manifest/dependency';
import { resolve } from '../sources';
export default class Resolver {
    constructor(config) {
        this.config = config;
        this.graph = new Map();
        this.loading = new Map();
        this.preferred = new Map();
    }
    async get(dependency) {
        const { name } = dependency;
        if (this.loading.has(name))
            await this.loading.get(name);
        let resolution = this.graph.get(name);
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
    getRegistration(id) {
        const [name, version] = id.split('@', 2);
        if (!this.graph.has(name))
            return;
        const { registered } = this.graph.get(name);
        return registered.find(registration => registration.version === version);
    }
    prefer(preferred) {
        for (const registration of preferred) {
            this.preferred.set(registration.name, registration);
        }
    }
    [Symbol.iterator]() {
        return this.graph.entries();
    }
}
