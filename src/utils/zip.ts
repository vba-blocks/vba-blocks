import { ArchiverOptions } from 'archiver';
import { createWriteStream } from 'fs';
import { __default } from './interop';

export interface FileMapping {
  [absolute: string]: string;
}

export async function zip(
  dir: string,
  file: string,
  format?: string,
  options?: ArchiverOptions
): Promise<void>;
export async function zip(
  files: FileMapping,
  file: string,
  format?: string,
  options?: ArchiverOptions
): Promise<void>;
export async function zip(
  files: string | FileMapping,
  file: string,
  format: string = 'zip',
  options: ArchiverOptions = {}
): Promise<void> {
  const { create: createArchive } = (await import('archiver')).default;

  return new Promise<void>((resolve, reject) => {
    try {
      const output = createWriteStream(file);
      const archive = createArchive(format, options);

      output.on('close', () => resolve());
      output.on('error', reject);

      archive.pipe(output);
      archive.on('error', reject);

      if (typeof files === 'string') {
        archive.directory(files, '/');
      } else {
        for (const [path, name] of Object.entries(files)) {
          archive.file(path, { name });
        }
      }

      archive.finalize();
    } catch (err) {
      reject(err);
    }
  });
}

export interface UnzipOptions {
  filter?: (file: UnzipFile, index: number, files: UnzipFile[]) => boolean;
  map?: (file: UnzipFile, index: number, files: UnzipFile[]) => UnzipFile;
  plugins?: UnzipPlugin[];
  strip?: number;
}
export type UnzipPlugin = (buffer: Buffer) => Promise<UnzipFile[]>;

export interface UnzipFile {
  data: Buffer;
  mode: number;
  mtime: string;
  path: string;
  type: string;
}

export async function unzip(file: string, dest: string, options?: UnzipOptions): Promise<void> {
  const decompress = __default(await import('decompress'));

  await decompress(file, dest, options);
}
