import { Manifest, Source, Dependency, Reference, Target } from './types';
export declare function applyChanges(changes: string[]): void;
export declare function addSource(manifest: Manifest, source: Source): string;
export declare function removeSource(_: Manifest, name: string): string;
export declare function addDependency(manifest: Manifest, dependency: Dependency): string;
export declare function removeDependency(_: Manifest, name: string): string;
export declare function addReference(_manifest: Manifest, reference: Reference): string;
export declare function removeReference(_manifest: Manifest, name: string): string;
export declare function addTarget(manifest: Manifest, target: Target): string;
