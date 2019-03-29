import { createWriteStream } from 'fs';

export async function zip(dir: string, file: string): Promise<void> {
  const { create: createArchive } = (await import('archiver')).default;

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
  const decompress = (await import('decompress')).default;
  await decompress(file, dest);
}
