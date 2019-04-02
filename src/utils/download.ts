import fetch from 'node-fetch';
import { dirname } from './path';
import { createWriteStream } from 'fs';
import { ensureDir } from './fs';

export default async function download(url: string, dest: string): Promise<void> {
  await ensureDir(dirname(dest));

  return fetch(url).then(response => {
    const file = createWriteStream(dest);

    return new Promise<void>((resolve, reject) => {
      response.body
        .pipe(file)
        .on('finish', () => resolve())
        .on('error', reject);
    });
  });
}
