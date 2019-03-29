const { promisify } = require('util');
const { get: httpsGet } = require('https');
const { join, dirname, basename } = require('path');
const { createWriteStream } = require('fs');
const { ensureDir, pathExists, move, remove } = require('fs-extra');
const { create: createArchive } = require('archiver');
const tmpDir = promisify(require('tmp').dir);
const decompress = require('decompress');

const { version } = require('../package.json');
const dist = join(__dirname, '../dist');
const unpacked = join(dist, 'unpacked');

const node_version = 'v10.15.3';
const vendor = join(__dirname, 'vendor');
const node = join(vendor, `node-${node_version}`);

main().catch(err => {
  console.error(err);
  process.exit(1);
});

async function main() {
  await downloadNode();

  await createZip('win');
  await createZip('mac');
}

async function downloadNode() {
  if (await pathExists(node)) return;

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

  await ensureDir(node);
  await Promise.all([
    decompress(join(dir, windows), node, {
      filter: file => /node\.exe$/.test(file.path),
      map: filename
    }),
    decompress(join(dir, mac), node, {
      filter: file => /node$/.test(file.path),
      map: filename
    })
  ]);

  await remove(dir);
}

async function createZip(target) {
  const file = join(dist, `vba-blocks-v${version}-${target}.zip`);
  const node_exe = target === 'win' ? 'node.exe' : 'node';
  await zip({ directories: [unpacked], files: [join(node, node_exe)] }, file);
}

async function zip(options, dest) {
  if (Array.isArray(options)) options = { directories: options };
  if (typeof options === 'string') options = { directories: [options] };

  const { directories = [], files = [] } = options;

  return new Promise((resolve, reject) => {
    try {
      const output = createWriteStream(dest);
      const archive = createArchive('zip');

      output.on('close', resolve);
      output.on('error', reject);

      archive.pipe(output);
      archive.on('error', reject);

      for (const dir of directories) {
        archive.directory(dir, '/');
      }
      for (const file of files) {
        archive.file(file, { name: basename(file) });
      }

      archive.finalize();
    } catch (err) {
      reject(err);
    }
  });
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
