/// <reference types="node" />
import { Component as IComponent, ComponentType, ComponentDetails } from './types';
export declare class Component implements IComponent {
    type: ComponentType;
    code: string;
    details: ComponentDetails;
    constructor(type: ComponentType, code: Buffer | string, details?: ComponentDetails);
    readonly name: string;
    readonly binary_path: string | undefined;
    readonly filename: string;
    static load(path: string, details?: {
        dependency?: string;
        binary_path?: string;
    }): Promise<Component>;
}
export declare const extension_to_type: {
    [extension: string]: ComponentType;
};
export declare const type_to_extension: {
    [type: string]: string;
};
export declare function byComponentName(a: IComponent, b: IComponent): number;
export declare function normalizeComponent(component: IComponent, dir: string): IComponent;
