import { Manifest } from './types';
export declare function parseManifest(value: any, dir: string): Manifest;
export declare function loadManifest(dir: string): Promise<Manifest>;
export declare function writeManifest(manifest: Manifest, dir: string): Promise<void>;
