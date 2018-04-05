import { join } from 'path';
import { readFile } from '../../src/utils';
import { loadManifest, addSrc, removeSrc } from '../../src/manifest';

const FIXTURES = join(__dirname, '../fixtures');

test('should add src', async () => {
  const manifest = await loadManifest(join(FIXTURES, 'project'));
  const lines = await readManifestLines(manifest.dir);

  const operation = addSrc({
    name: 'd',
    path: join(FIXTURES, 'project', 'src', 'd.bas'),
    optional: false
  });
  const result = operation.run(manifest, lines);

  expect(result).toMatchSnapshot();
});

test('should add optional src', async () => {
  const manifest = await loadManifest(join(FIXTURES, 'project'));
  const lines = await readManifestLines(manifest.dir);

  let operation = addSrc({
    name: 'd',
    path: join(FIXTURES, 'project', 'src', 'd.bas'),
    optional: true
  });
  let result = operation.run(manifest, lines);

  operation = addSrc({
    name: 'e',
    path: join(FIXTURES, 'project', 'src', 'e.cls')
  });
  result = operation.run(manifest, result);

  expect(result).toMatchSnapshot();
});

test('should add src to empty manifest', async () => {
  const manifest = await loadManifest(join(FIXTURES, 'project'));
  const lines = [
    '[package]',
    'name = "empty"',
    'version = "0.0.0"',
    'authors = []'
  ];

  const operation = addSrc({
    name: 'd',
    path: join(FIXTURES, 'project', 'src', 'd.bas'),
    optional: false
  });
  const result = operation.run(manifest, lines);

  expect(result).toMatchSnapshot();
});

test('should remove inline src', async () => {
  const manifest = await loadManifest(join(FIXTURES, 'project'));
  const lines = await readManifestLines(manifest.dir);

  const operation = removeSrc({
    name: 'b',
    path: '...'
  });
  const result = operation.run(manifest, lines);

  expect(result).toMatchSnapshot();
});

test('should remove table src', async () => {
  const manifest = await loadManifest(join(FIXTURES, 'project'));
  const lines = await readManifestLines(manifest.dir);

  const operation = removeSrc({
    name: 'c',
    path: '...'
  });
  const result = operation.run(manifest, lines);

  expect(result).toMatchSnapshot();
});

async function readManifestLines(dir: string): Promise<string[]> {
  const file = join(dir, 'vba-block.toml');
  const raw = (await readFile(file)).toString();

  return raw.replace(/\r/g, '').split('\n');
}
