import { readFile } from './fs';
import hash from './hash';

interface UploadOptions {
  bucket: string;
  filename: string;
  path: string;
  acl?: string;
}

export async function upload({
  bucket: Bucket,
  filename: Key,
  path,
  acl: ACL = 'public-read'
}: UploadOptions) {
  // Late-bound to give .env a chance to be loaded
  const { S3 } = await import('aws-sdk');
  const s3 = new S3();

  const Body = await readFile(path);
  const ContentMD5 = hash(Body, { algorithm: 'md5', digest: 'base64' });

  return await s3.upload({ Bucket, Key, Body, ACL, ContentMD5 }).promise();
}
