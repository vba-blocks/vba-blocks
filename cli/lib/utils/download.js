const https = require('https');
const { dirname } = require('path');
const { createWriteStream, ensureDir } = require('fs-extra');

module.exports = async function download(url, dest) {
  await ensureDir(dirname(dest));

  return new Promise((resolve, reject) => {
    https
      .get(url, response => {
        try {
          const code = response.statusCode;
          if (code >= 400) {
            reject(new Error(`${code} ${response.statusMessage}`));
          } else if (code >= 300) {
            download(response.headers.location, dest).then(resolve, reject);
          } else {
            response
              .pipe(createWriteStream(dest))
              .on('finish', () => resolve())
              .on('error', reject);
          }
        } catch (err) {
          console.error(err);
        }
      })
      .on('error', reject);
  });
};
