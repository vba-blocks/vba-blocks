import { Config } from '../types';
import { Dependency } from '../manifest/types';
import { Registration } from '../sources/types';
import { DependencyGraph, Resolver as IResolver, Resolution, ResolutionGraph } from './types';
export default class Resolver implements IResolver {
    config: Config;
    graph: ResolutionGraph;
    loading: Map<string, Promise<Registration[]>>;
    preferred: Map<string, Registration>;
    constructor(config: Config);
    get(dependency: Dependency): Promise<Resolution>;
    getRegistration(id: string): Registration | undefined;
    prefer(preferred: DependencyGraph): void;
    [Symbol.iterator](): IterableIterator<[string, Resolution]>;
}
