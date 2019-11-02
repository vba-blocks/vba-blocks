const { promisify } = require('util');
const { resolve, join } = require('path');
const execFile = promisify(require('child_process').exec);
const { readFile, ensureFile, pathExists } = require('fs-extra');
const { parse } = require('toml-patch');
const mri = require('mri');
const checksum = require('./lib/checksum');
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
  if (dryrun) dryrun = '[dryrun] ';

  const dir = resolve(input);
  if (!(await pathExists(dir))) {
    throw new Error(`Input directory "${input}" not found`);
  }

  const manifest_path = join(dir, 'vba-block.toml');
  if (!(await pathExists(manifest_path))) {
    throw new Error(`vba-block.toml not found in input directory "${input}"`);
  }

  const manifest = parse(await readFile(manifest_path, 'utf8'));
  if (!manifest.package) {
    throw new Error(`publish only supports packages ([package] in vba-block.toml)`);
  }

  const { name, version } = manifest.package;
  const block_name = `${sanitizeName(name)}-v${version}.block`;
  const block_path = join(dir, 'build', block_name);
  if (!(await pathExists(block_path))) {
    console.log(`${dryrun}Packing ${block_name}...`);

    if (!dryrun) {
      await execFile('node', [join(__dirname, 'pack.js'), input]);
    }
  }

  console.log(`${dryrun}Uploading ${block_name}...`);
  if (!dryrun) {
    await s3.upload({ filename: block_name, path: block_path });
  }

  console.log(`${dryrun}Validing checksum...`);
  const cksum = await checksum(block_path);
  if (!dryrun) {
    const downloaded = await s3.download({ block_name });
    const comparison = await checksum(downloaded);
    if (comparison !== cksum) {
      throw new Error(`Uploaded checksum does not match (${comparison} vs ${cksum})`);
    }
  }

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
  const new_entry = { name, vers: version, deps, cksum };

  console.log(`${dryrun}Publishing ${JSON.stringify(new_entry)}...`);

  console.log(`${dryrun}git pull "${registry}"...`);
  if (!dryrun) {
    await git.pull({ dir: registry });
  }

  const entries_path = join(registry, sanitizeName(name));
  if (!dryrun) {
    await ensureFile(entries_path);
  }

  let raw_entries = '';
  try {
    raw_entries = await readFile(entries_path, 'utf8');
  } catch (error) {}

  const entries = raw_entries
    .split('\n')
    .filter(Boolean)
    .map(entry => JSON.parse(entry));
  for (const existing of entries) {
    if (existing.vers === version) {
      throw new Error(`${name} v${version} has already been published`);
    }
  }

  const added = entries.concat(new_entry).map(value => JSON.stringify(value));
  const raw_added = `${added.join('\n')}\n`;
  console.log(`${dryrun}Writing to ${entries_path}...`);
  if (!dryrun) {
    await writeFile(entries_path, raw_added);
  }

  const message = `Publish ${name} v${version}`;
  console.log(`${dryrun}git commit -am "${message}"...`);
  if (!dryrun) {
    await git.commit({ dir: registry, message });
  }

  console.log(`${dryrun}git push...`);
  if (!dryrun) {
    // TODO await git.push({ dir });
  }

  console.log(`Published ${name} v${version}!`);

  console.log(`\nNOTICE To complete publishing, run "git push" in the registry\n`);
}
