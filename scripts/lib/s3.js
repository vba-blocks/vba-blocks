const { promisify } = require('util');
const { join } = require('path');
const { resolve: joinUrl } = require('url');
const { readFile } = require('fs-extra');
const tmpDir = promisify(require('tmp').dir);
const download = require('./download');

require('dotenv').config({ path: join(__dirname, '../../.env') });
const Bucket = process.env.VBA_BLOCKS_AWS_S3_BUCKET;

// Load AWS_PROFILE from .env before loading SDK
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const upload = promisify(s3.upload);

module.exports = {
  async upload({ filename: Key, path }) {
    const Body = await readFile(path);
    return await upload({ Bucket, Key, Body });
  },

  async download({ path, dest }) {
    const url = joinUrl('https://packages.vba-blocks.com', file);
    if (!dest) {
      const tmp_dir = await tmpDir();
      dest = join(tmp_dir, path);
    }

    await download(url, dest);

    return dest;
  }
};
