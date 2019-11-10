const { promisify } = require('util');
const { resolve, join } = require('path');
const assert = require('assert');
const execFile = promisify(require('child_process').execFile);
const { readFile, ensureFile, pathExists, writeFile } = require('fs-extra');
const mri = require('mri');
const tmpDir = promisify(require('tmp').dir);
const { parse } = require('toml-patch');
const joinUrl = require('url-join');
const checksum = require('./lib/checksum');
const download = require('./lib/download');
const git = require('./lib/git');
const s3 = require('./lib/s3');
const sanitizeName = require('./lib/sanitize-name');

const registry = join(__dirname, 'registry');

main().catch(error => {
  console.error(error);
  process.exit(1);
});

// Usage: node scripts/publish ./input/dir
async function main() {
  let {
    _: [input],
    dryrun = false
  } = mri(process.argv.slice(2));

  const dir = resolve(input);
  assert(await pathExists(dir), `Input directory "${input}" not found`);

  const manifest_path = join(dir, 'vba-block.toml');
  assert(await pathExists(manifest_path), `vba-block.toml not found in input directory "${input}"`);

  const manifest = parse(await readFile(manifest_path, 'utf8'));
  assert(manifest.package, `publish only supports packages ([package] in vba-block.toml)`);

  const cksum = await uploadAndValidate(dir, manifest, { dryrun });
  const entry = generateEntry(manifest, cksum);
  await publishToRegistry(entry, { dryrun });
}

async function uploadAndValidate(dir, manifest, { dryrun }) {
  const { name, version } = manifest.package;
  const block_name = `${sanitizeName(name)}-v${version}.block`;
  const block_path = join(dir, 'build', block_name);

  if (!(await pathExists(block_path))) {
    await act(dryrun, `Packing ${block_name}...`, async () => {
      await execFile('node', [join(__dirname, 'pack.js'), dir]);
    });
  }

  await act(dryrun, `Uploading ${block_name}...`, () =>
    s3.upload({ filename: block_name, path: block_path })
  );

  const cksum = await checksum(block_path);
  await act(dryrun, 'Validating checksum...', async () => {
    const url = joinUrl('https://packages.vba-blocks.com', block_name);
    const dest = join(await tmpDir(), block_name);

    await download(url, dest);

    const comparison = await checksum(dest);
    assert(
      comparison === cksum,
      `Uploaded checksum does not match (downloaded: ${comparison} vs expected: ${cksum})`
    );
  });

  return cksum;
}

function generateEntry(manifest, cksum) {
  const { name, version } = manifest.package;
  const deps = [];

  if (manifest.dependencies) {
    for (const [name, value] of Object.entries(manifest.dependencies)) {
      if (typeof value === 'string') {
        deps.push({ name, req: value });
      } else if (value.version) {
        deps.push({ name, req: value.version });
      } else {
        throw new Error(
          `Only registry dependencies are supported when publishing, "${name}" is using an supported format`
        );
      }
    }
  }

  return { name, vers: version, deps, cksum };
}

async function publishToRegistry(entry, { dryrun }) {
  const { name, vers: version } = entry;

  console.log(`${dryrun ? '[dryrun] ' : ''}Publishing\n\n${JSON.stringify(entry, null, 2)}\n`);

  // // 1. git pull (or git clone if not found)
  // const registry_exists = await pathExists(join(registry, '.git'));
  // if (!registry_exists) {
  //   await act(dryrun, `git clone...`, () => git.clone({ dir: __dirname }));
  // } else {
  //   await act(dryrun, `git pull "${registry}"...`, () => git.pull({ dir: registry }));
  // }

  // // 2. Load existing entries
  // const entries_path = join(registry, sanitizeName(name));
  // await act(dryrun, () => ensureFile(entries_path));

  // let raw_entries = '';
  // try {
  //   raw_entries = await readFile(entries_path, 'utf8');
  // } catch (error) {}

  // const entries = raw_entries
  //   .split('\n')
  //   .filter(Boolean)
  //   .map(entry => JSON.parse(entry));

  // // 3. Add to entries
  // for (const existing of entries) {
  //   if (existing.vers === version) {
  //     throw new Error(`${name} v${version} has already been published`);
  //   }
  // }
  // const added = entries.concat(entry).map(value => JSON.stringify(value));

  // // 4. Write to registry
  // const raw_added = `${added.join('\n')}\n`;
  // await act(dryrun, `Writing to ${entries_path}...`, () => writeFile(entries_path, raw_added));

  // // 5. Commit
  // const message = `Publish ${name} v${version}`;
  // await act(dryrun, `git commit -am "${message}"...`, () => git.commit({ dir: registry, message }));

  // 6. Push
  await act(dryrun, `git push...`, async () => {
    await git.push({ dir: registry });
  });

  console.log(`Published ${name} v${version}!`);
}

async function act(dryrun, message, action) {
  if (typeof message === 'function') {
    action = message;
    message = null;
  }

  if (message) console.log(`${dryrun ? '[dryrun] ' : ''}${message}`);
  if (!dryrun) await action();
}
