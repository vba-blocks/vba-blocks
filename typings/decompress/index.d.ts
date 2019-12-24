declare module 'decompress' {
  export interface File {
    data: Buffer;
    mode: number;
    mtime: string;
    path: string;
    type: string;
  }

  export type DecompressPlugin = unknown;

  export interface DecompressOptions {
    filter?: (file: File) => boolean;
    map?: (file: File) => File;
    plugins?: Plugin[];
    strip?: number;
  }

  export default function decompress(src: string, dest: string): Promise<File>;
  export default function decompress(
    src: string,
    dest: string,
    options?: DecompressOptions
  ): Promise<File>;
}
