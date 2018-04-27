import { createWriteStream } from 'fs';
import { create as createArchive } from 'archiver';
import decompress from 'decompress';

export async function zip(dir: string, file: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    try {
      const output = createWriteStream(file);
      const archive = createArchive('zip');

      output.on('close', () => resolve());
      output.on('error', reject);

      archive.pipe(output);
      archive.on('error', reject);

      archive.directory(dir, '/');
      archive.finalize();
    } catch (err) {
      reject(err);
    }
  });
}

export async function unzip(file: string, dest: string): Promise<void> {
  await decompress(file, dest);
}
