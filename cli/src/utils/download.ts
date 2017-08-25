import * as https from 'https';
import { dirname } from 'path';
import { createWriteStream, ensureDir } from 'fs-extra';

export default async function download(url: string, dest: string) {
  await ensureDir(dirname(dest));

  return new Promise<void>((resolve, reject) => {
    https
      .get(url, response => {
        try {
          const code = response.statusCode;
          if (code >= 400) {
            reject(new Error(`${code} ${response.statusMessage}`));
          } else if (code >= 300) {
            const location = response.headers.location;
            const redirect = Array.isArray(location) ? location[0] : location;

            download(redirect, dest).then(resolve, reject);
          } else {
            response
              .pipe(createWriteStream(dest))
              .on('finish', () => resolve())
              .on('error', reject);
          }
        } catch (err) {
          console.error(err);
        }
      })
      .on('error', reject);
  });
}
