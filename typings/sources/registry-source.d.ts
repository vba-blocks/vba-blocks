import { Dependency } from '../manifest/types';
import { Source, Registration, RegistryOptions } from './types';
export default class RegistrySource implements Source {
    name: string;
    local: {
        index: string;
        packages: string;
    };
    remote: {
        index: string;
        packages: string;
    };
    sources: string;
    pulling?: Promise<void>;
    up_to_date: boolean;
    constructor({ name, index, packages }: RegistryOptions);
    resolve(dependency: Dependency): Promise<Registration[]>;
    fetch(registration: Registration): Promise<string>;
    pull(): Promise<void>;
}
export declare function pullIndex(local: string, remote: string): Promise<void>;
export declare function parseRegistration(registry: string, value: any): Registration;
export declare function sanitizePackageName(name: string): string;
export declare function getRemotePackage(packages: string, registration: Registration): string;
export declare function getLocalPackage(packages: string, registration: Registration): string;
export declare function getSource(sources: string, registration: Registration): string;
