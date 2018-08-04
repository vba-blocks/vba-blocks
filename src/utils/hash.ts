import { createHash } from 'crypto';

export type Encoding = 'utf8' | 'ascii';
export type Digest = 'hex' | 'base64';

export interface HashOptions {
  algorithm?: string;
  encoding?: Encoding;
  digest?: Digest;
}

export default function hash(
  data: string | Buffer,
  options: HashOptions = {}
): string {
  const { algorithm = 'sha256', encoding = 'utf8', digest = 'hex' } = options;

  return createHash(algorithm)
    .update(Buffer.isBuffer(data) ? data.toString('utf-8') : data, encoding)
    .digest(digest);
}
