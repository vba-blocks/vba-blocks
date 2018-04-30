import { createHash } from 'crypto';

export type Encoding = 'utf8' | 'ascii';
export type Digest = 'hex' | 'base64';

export default function hash(
  data: string | Buffer,
  algorithm: string = 'sha256',
  encoding: Encoding = 'utf8',
  digest: Digest = 'hex'
): string {
  return createHash(algorithm)
    .update(data, 'utf8')
    .digest(digest);
}
