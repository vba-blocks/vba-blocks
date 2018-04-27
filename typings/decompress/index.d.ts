declare module 'decompress' {
  export interface File {
    data: Buffer;
    mode: number;
    mtime: string;
    path: string;
    type: string;
  }

  export default function decompress(src: string, dest: string): Promise<File>;
}
