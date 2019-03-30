require('dotenv').config();

const { promisify } = require('util');
const { join, basename } = require('path');
const Octokit = require('@octokit/rest');
const tmpFile = promisify(require('tmp').file);
const editor = require('editor');
const { writeFile, readFile, remove } = require('fs-extra');
const mri = require('mri');

const octokit = new Octokit({
  auth: `token ${process.env.VBA_BLOCKS_GITHUB_TOKEN}`
});
const { version } = require('../package.json');
const args = mri(process.argv.slice(2), {
  alias: { D: 'draft' }
});

main().catch(err => {
  console.error(err);
  process.exit(1);
});

async function main() {
  const prerelease = version.includes('-');
  const draft = !!args.draft;
  const tag = `v${version}`;

  const body = await editText();
  if (!body) throw new Error('No release notes entered/detected');

  console.log(`Creating release for ${tag}`);
  const release = await octokit.repos.createRelease({
    owner: 'vba-blocks',
    repo: 'vba-blocks',
    tag_name: tag,
    name: `vba-blocks v${version}`,
    body,
    prerelease,
    draft
  });

  console.log('Uploading packages');
  await Promise.all([
    uploadAsset(join(__dirname, '../dist', `vba-blocks-win.zip`), release),
    uploadAsset(join(__dirname, '../dist', `vba-blocks-mac.zip`), release)
  ]);

  console.log('Done!');
}

async function editText(initial = '') {
  const file = await tmpFile({ discardDescriptor: true });
  if (initial) await writeFile(file, initial);

  return new Promise((resolve, reject) => {
    editor(file, async code => {
      if (code > 0) return reject('Failed to edit text');

      const text = await readFile(file, 'utf8');
      await remove(file);

      resolve(text);
    });
  });
}

async function uploadAsset(path, release) {
  const url = release.data.upload_url;
  const file = await readFile(path);
  const headers = {
    'content-length': file.length,
    'content-type': 'application/zip'
  };
  const name = basename(path);

  await octokit.repos.uploadReleaseAsset({
    headers,
    url,
    name,
    file
  });
}
