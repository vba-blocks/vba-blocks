const mri = require('mri');
const walkSync = require('walk-sync');
const { parseName } = require('../lib');
const { fs, path, toml, zip } = require('../lib/utils');

const { ensureDir, pathExists, readFile, remove } = fs;
const { dirname, join, relative, resolve } = path;
const { parse } = toml;

const IS_MANIFEST = /vba-block\.toml/;
const IS_README = /readme/i;
const IS_CHANGELOG = /changes|changelog|history/i;
const IS_LICENSE = /license|licence/i;
const IS_NOTICE = /notice/i;

const usage = `
Pack vba-blocks package for publishing

Usage: node scripts/pack <input>

Options:
  <input>   Input directory for package
`;

main().catch(error => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const {
    _: [input],
    force = false,
    help
  } = mri(process.argv.slice(2), { alias: { h: 'help' } });

  if (help) {
    console.log(usage);
    return;
  }

  const dir = resolve(input);
  if (!(await pathExists(dir))) {
    throw new Error(`Input directory "${input}" not found`);
  }

  const manifest_path = join(dir, 'vba-block.toml');
  if (!(await pathExists(manifest_path))) {
    throw new Error(`vba-block.toml not found in input directory "${input}"`);
  }

  const manifest = await parse(await readFile(manifest_path, 'utf8'));
  if (!manifest.package) {
    throw new Error(`pack only supports packages ([package] in vba-block.toml)`);
  }

  const { name, version } = manifest.package;
  const block_name = `${parseName(name).name}-v${version}.block`;
  const block_path = join(dir, 'build', block_name);
  if (await pathExists(block_path)) {
    if (!force) {
      throw new Error(`A block named "${block_name}" already exists. Use --force to overwrite it`);
    } else {
      await remove(block_path);
    }
  }

  const src_files = manifest.src
    ? Object.values(manifest.src).map(src => {
        return join(dir, typeof src === 'string' ? src : src.path);
      })
    : [];

  const files = walkSync(dir, { directories: false })
    .map(path => join(dir, path))
    .filter(file => {
      return (
        IS_MANIFEST.test(file) ||
        IS_README.test(file) ||
        IS_CHANGELOG.test(file) ||
        IS_LICENSE.test(file) ||
        IS_NOTICE.test(file) ||
        src_files.includes(file)
      );
    })
    .reduce((memo, file) => {
      memo[file] = relative(dir, file);
      return memo;
    }, {});

  await ensureDir(dirname(block_path));
  await zip(files, block_path);

  console.log(`Done. Created ${block_path}`);
}
