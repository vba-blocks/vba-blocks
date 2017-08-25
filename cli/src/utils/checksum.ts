import { createHash } from 'crypto';
import { createReadStream } from 'fs-extra';

export default async function checksum(file: string, algorithm = 'sha1') {
  return new Promise<string>((resolve, reject) => {
    const hash = createHash(algorithm);
    createReadStream(file)
      .on('data', data => hash.update(data, 'utf8'))
      .on('end', () => resolve(hash.digest('hex')))
      .on('error', reject);
  });
}
