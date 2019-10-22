const { promisify } = require('util');
const { join, dirname, basename } = require('path');
const { get: httpsGet } = require('https');
const { createWriteStream } = require('fs');
const { ensureDir, pathExists, remove, writeFile, readFile } = require('fs-extra');
const tmpDir = promisify(require('tmp').dir);
const decompress = require('decompress');

const node_version = 'v12.13.0';
const vendor = join(__dirname, '../vendor');
const version = join(vendor, '.version');

main().catch(err => {
  console.error(err);
  process.exit(1);
});

async function main() {
  await downloadNode();
}

async function downloadNode() {
  const version_exists = await pathExists(version);
  const previous_version = version_exists && (await readFile(version, 'utf8')).trim();

  if (previous_version === node_version) return;

  const base = `https://nodejs.org/dist/${node_version}/`;
  const windows = `node-${node_version}-win-x86.zip`;
  const mac = `node-${node_version}-darwin-x64.tar.gz`;

  console.log(`Downloading node ${node_version}...`);

  const dir = await tmpDir();
  await Promise.all([
    download(`${base}${windows}`, join(dir, windows)),
    download(`${base}${mac}`, join(dir, mac))
  ]);

  console.log('Unzipping node');

  const filename = file => {
    file.path = basename(file.path);
    return file;
  };

  await ensureDir(vendor);
  await Promise.all([
    decompress(join(dir, windows), vendor, {
      filter: file => /node\.exe$/.test(file.path),
      map: filename
    }),
    decompress(join(dir, mac), vendor, {
      filter: file => /node$/.test(file.path),
      map: filename
    })
  ]);

  await remove(dir);
  await writeFile(join(vendor, '.version'), node_version);
}

async function download(url, dest) {
  await ensureDir(dirname(dest));

  return new Promise((resolve, reject) => {
    httpsGet(url, response => {
      try {
        const code = response.statusCode;
        if (code && code >= 400) {
          reject(new Error(`${code} ${response.statusMessage}`));
        } else if (code && code >= 300) {
          const location = response.headers.location;
          const redirect = Array.isArray(location) ? location[0] : location;

          download(redirect, dest).then(resolve, reject);
        } else {
          const file = createWriteStream(dest);
          response
            .pipe(file)
            .on('finish', () => resolve())
            .on('error', reject);
        }
      } catch (err) {
        console.error(err);
      }
    }).on('error', reject);
  });
}

module.exports = {
  versions: {
    node: node_version
  }
};
