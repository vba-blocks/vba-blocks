import { createWriteStream } from 'fs';
import { standalone as sortPaths } from 'path-sort';
import walkSync from 'walk-sync';
import { readFile, writeFile } from './fs';
import { __default } from './interop';
import { join, relative } from './path';

export interface FileMapping {
  [absolute: string]: string;
}

const epoch = new Date(0);

const byFileMapping = (() => {
  const sort = sortPaths();
  return (a: [string, string], b: [string, string]): -1 | 0 | 1 => sort(a[1], b[1]) || 0;
})();

export async function zip(dir: string, file: string): Promise<void>;
export async function zip(files: FileMapping, file: string): Promise<void>;
export async function zip(files: string | FileMapping, file: string): Promise<void> {
  const JSZip = __default(await import('jszip'));
  const zip = new JSZip();

  if (typeof files === 'string') {
    files = loadFileMapping(files);
  }

  for (const [path, name] of Object.entries(files).sort(byFileMapping)) {
    const data = await readFile(path);
    zip.file(name, data, { date: epoch, createFolders: true });
  }

  const data = await zip.generateAsync({ type: 'nodebuffer' });
  await writeFile(file, data);
}

export async function tar(files: string, file: string): Promise<void>;
export async function tar(files: FileMapping, file: string): Promise<void>;
export async function tar(files: string | FileMapping, file: string) {
  const { create: createArchive } = (await import('archiver')).default;

  return new Promise<void>((resolve, reject) => {
    try {
      const output = createWriteStream(file);
      const archive = createArchive('tar', { gzip: true });

      output.on('close', () => resolve());
      output.on('error', reject);

      archive.pipe(output);
      archive.on('error', reject);

      if (typeof files === 'string') {
        files = loadFileMapping(files);
      }

      for (const [path, name] of Object.entries(files).sort(byFileMapping)) {
        archive.file(path, { name });
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

function loadFileMapping(dir: string): FileMapping {
  return walkSync(dir, { directories: false })
    .map(path => join(dir, path))
    .reduce((memo, file) => {
      memo[file] = relative(dir, file);
      return memo;
    }, {} as FileMapping);
}
