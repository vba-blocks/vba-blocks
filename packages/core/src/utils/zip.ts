import { createWriteStream } from 'fs-extra';
import { create as createArchive } from 'archiver';

export default async function zip(dir: string, file: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const output = createWriteStream(file);
    const archive = createArchive('zip');

    output.on('close', () => resolve());
    archive.on('error', reject);

    archive.pipe(output);

    archive.directory(dir, '/');
    archive.finalize();
  });
}
