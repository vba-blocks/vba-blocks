declare module 'fs-extra/lib/copy' {
  export function copy(src: string, dest: string, options?: CopyOptions): Promise<void>;
  export function copy(src: string, dest: string, callback: (err: Error) => void): void;
  export function copy(
    src: string,
    dest: string,
    options: CopyOptions,
    callback: (err: Error) => void
  ): void;
}

declare module 'fs-extra/lib/empty' {
  export function emptyDir(path: string): Promise<void>;
  export function emptyDir(path: string, callback: (err: Error) => void): void;
}

declare module 'fs-extra/lib/mkdirs' {
  export function ensureDir(path: string): Promise<void>;
  export function ensureDir(path: string, callback: (err: Error) => void): void;
  export function ensureDirSync(path: string): void;
}

declare module 'fs-extra/lib/move' {
  export function move(src: string, dest: string, options?: MoveOptions): Promise<void>;
  export function move(src: string, dest: string, callback: (err: Error) => void): void;
  export function move(
    src: string,
    dest: string,
    options: MoveOptions,
    callback: (err: Error) => void
  ): void;
}

declare module 'fs-extra/lib/path-exists' {
  export function pathExists(path: string): Promise<boolean>;
  export function pathExists(path: string, callback: (err: Error, exists: boolean) => void): void;
}

declare module 'fs-extra/lib/json/jsonfile' {
  export function readJson(file: string, options?: ReadOptions): Promise<any>;
  export function readJson(file: string, callback: (err: Error, jsonObject: any) => void): void;
  export function readJson(
    file: string,
    options: ReadOptions,
    callback: (err: Error, jsonObject: any) => void
  ): void;
  export function readJSON(file: string, options?: ReadOptions): Promise<any>;
  export function readJSON(file: string, callback: (err: Error, jsonObject: any) => void): void;
  export function readJSON(
    file: string,
    options: ReadOptions,
    callback: (err: Error, jsonObject: any) => void
  ): void;
}

declare module 'fs-extra/lib/remove' {
  export function remove(dir: string): Promise<void>;
  export function remove(dir: string, callback: (err: Error) => void): void;
}
