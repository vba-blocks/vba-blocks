const { createHash } = require('crypto');
const { createReadStream } = require('fs');

module.exports = async function checksum(file, algorithm = 'sha1') {
  return new Promise((resolve, reject) => {
    const hash = createHash(algorithm);
    createReadStream(file)
      .on('data', data => hash.update(data, 'utf8'))
      .on('end', () => resolve(hash.digest('hex')))
      .on('error', reject);
  });
};
