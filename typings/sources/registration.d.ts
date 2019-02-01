import { Snapshot, Dependency } from '../manifest/types';
import { Registration } from './types';
export declare function fromSnapshot(snapshot: Snapshot, source: string): Registration;
export declare function getRegistrationId(name: Snapshot): string;
export declare function getRegistrationId(name: string, version: string): string;
export declare function getRegistrationSource(type: string, value: string, details?: string): string;
export declare function getSourceParts(source: string): {
    type: string;
    value: string;
    details: string | undefined;
};
export declare function toDependency(registration: Registration): Dependency;
export declare function isRegistration(value: Registration | Dependency): value is Registration;
