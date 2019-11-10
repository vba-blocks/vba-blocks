const { join } = require('path');
const { readFile } = require('fs-extra');
const hash = require('./hash');

require('dotenv').config({ path: join(__dirname, '../../.env') });
const Bucket = process.env.VBA_BLOCKS_AWS_S3_BUCKET;

// Load AWS_PROFILE from .env before loading SDK
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

module.exports = {
  async upload({ filename: Key, path }) {
    const Body = await readFile(path);
    const ACL = 'public-read';
    const ContentMD5 = hash(Body, { algorithm: 'md5', digest: 'base64', prefix: false });

    return await s3.upload({ Bucket, Key, Body, ACL, ContentMD5 }).promise();
  }
};
