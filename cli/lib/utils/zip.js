const fs = require('fs');
const archiver = require('archiver');

module.exports = async function zip(dir, file) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(file);
    const archive = archiver('zip');

    output.on('close', () => resolve());
    archive.on('error', reject);

    archive.pipe(output);

    archive.directory(dir, '/');
    archive.finalize();
  });
};
