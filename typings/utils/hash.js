import { createHash } from 'crypto';
export default function hash(data, options = {}) {
    const { algorithm = 'sha256', digest = 'hex' } = options;
    return createHash(algorithm)
        .update(data)
        .digest(digest);
}
