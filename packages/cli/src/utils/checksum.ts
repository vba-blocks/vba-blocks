import { createHash } from 'crypto';
import { readFile } from './fs';

export default async function checksum(
  file: string,
  algorithm = 'sha256'
): Promise<string> {
  const hash = createHash(algorithm);
  const data = await readFile(file);

  hash.update(data, 'utf8');
  return hash.digest('hex');
}
