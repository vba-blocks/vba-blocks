import { createWriteStream } from 'fs-extra';
import archiver from 'archiver';

export default async function zip(dir: string, file: string) {
  return new Promise<void>((resolve, reject) => {
    const output = createWriteStream(file);
    const archive = archiver('zip');

    output.on('close', () => resolve());
    archive.on('error', reject);

    archive.pipe(output);

    archive.directory(dir, '/');
    archive.finalize();
  });
}
