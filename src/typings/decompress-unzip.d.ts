declare module 'decompress-unzip' {
  export interface File {
    data: Buffer;
    mode: number;
    mtime: string;
    path: string;
    type: string;
  }

  export default function decompressUnzip(): (buffer: Buffer) => Promise<File[]>;
}
