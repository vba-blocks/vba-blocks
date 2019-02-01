import { Target } from './manifest/types';
import { ImportGraph } from './build/types';
import { Application, Addin, AddinOptions, Project } from './types';
export declare const extensions: {
    [application: string]: string[];
};
export declare const addins: {
    [application: string]: string;
};
/**
 * Import graph of src and references into given target
 */
export declare function importGraph(project: Project, target: Target, graph: ImportGraph, file: string, options?: AddinOptions): Promise<void>;
/**
 * Export src and references from given target
 */
export declare function exportTo(project: Project, target: Target, staging: string, options?: AddinOptions): Promise<void>;
/**
 * Create a new document at the given path
 */
export declare function createDocument(project: Project, target: Target, options?: AddinOptions): Promise<string>;
/**
 * Get application, addin, and file for given target
 */
export declare function getTargetInfo(project: Project, target: Target, options?: AddinOptions): {
    application: Application;
    addin: Addin;
    file: string;
};
export declare function extensionToApplication(extension: string): Application;
