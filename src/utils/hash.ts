import { createHash } from 'crypto';

export type Encoding = 'utf8' | 'ascii';
export type Digest = 'hex' | 'base64';

export interface HashOptions {
  algorithm?: string;
  digest?: Digest;
}

export default function hash(data: Buffer, options: HashOptions = {}): string {
  const { algorithm = 'sha256', digest = 'hex' } = options;

  return createHash(algorithm)
    .update(data)
    .digest(digest);
}
