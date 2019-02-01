/// <reference types="node" />
import { Reference, Source } from '../manifest/types';
export interface BuildGraph {
    name: string;
    components: Component[];
    references: Reference[];
}
export interface ImportGraph {
    name: string;
    components: Source[];
    references: Reference[];
}
export interface Changeset {
    components: {
        added: Component[];
        changed: Component[];
        removed: Component[];
    };
    references: {
        added: Reference[];
        changed: Reference[];
        removed: Reference[];
    };
}
export declare type ComponentType = 'module' | 'class' | 'form' | 'document';
export interface ComponentDetails {
    path?: string;
    dependency?: string;
    binary?: Buffer;
}
export interface Component {
    type: ComponentType;
    code: string;
    details: ComponentDetails;
    readonly name: string;
    readonly binary_path: string | undefined;
    readonly filename: string;
}
