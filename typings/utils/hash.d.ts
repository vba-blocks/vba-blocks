/// <reference types="node" />
export declare type Encoding = 'utf8' | 'ascii';
export declare type Digest = 'hex' | 'base64';
export interface HashOptions {
    algorithm?: string;
    digest?: Digest;
}
export default function hash(data: Buffer, options?: HashOptions): string;
