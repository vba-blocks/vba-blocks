import { join } from 'path';
import { Manifest, parseManifest, loadManifest } from '../src/manifest';

const BASE_MANIFEST = {
  package: { name: 'package-name', version: '1.0.0', authors: ['Tim Hall'] }
};

const FIXTURES = join(__dirname, 'fixtures');

test('loads valid package metadata', () => {
  expect(parseManifest(BASE_MANIFEST)).toMatchSnapshot();
});

test('throws for invalid package metadata', () => {
  expect(() => parseManifest({})).toThrow();
  expect(() => parseManifest({ package: {} })).toThrow();
  expect(() => parseManifest({ package: { name: 'package-name' } })).toThrow();
  expect(() => parseManifest({ package: { version: '1.0.0' } })).toThrow();
  expect(() => parseManifest({ package: { authors: ['Tim Hall'] } })).toThrow();
});

test('loads valid sources', () => {
  const value = {
    ...BASE_MANIFEST,
    src: {
      A: 'src/a.bas',
      B: { path: 'src/b.cls' },
      C: { path: 'src/c.frm', optional: true }
    }
  };

  expect(parseManifest(value)).toMatchSnapshot();
});

test('throws for invalid sources', () => {
  const value = {
    ...BASE_MANIFEST,
    src: {
      missing_path: { optional: true }
    }
  };

  expect(() => parseManifest(value)).toThrow();
});

test('loads valid features', () => {
  const value = {
    ...BASE_MANIFEST,
    features: {
      default: ['a', 'b'],
      a: { src: ['A'] },
      b: { dependencies: ['B'] },
      c: { references: ['C'] }
    }
  };

  expect(parseManifest(value)).toMatchSnapshot();
});

test('throws for invalid features', () => {
  let value: any = { ...BASE_MANIFEST, features: { a: { src: 'A' } } };
  expect(() => parseManifest(value)).toThrow();

  value = { ...BASE_MANIFEST, features: { b: { dependencies: 'B' } } };
  expect(() => parseManifest(value)).toThrow();

  value = { ...BASE_MANIFEST, features: { c: { references: 'C' } } };
  expect(() => parseManifest(value)).toThrow();
});

test('loads valid dependencies', () => {
  const value = {
    ...BASE_MANIFEST,
    dependencies: {
      a: '^1.0.0',
      b: {
        version: '^2.0.0',
        optional: true,
        features: ['a', 'b'],
        'default-features': false
      },
      c: { path: 'packages/c' },
      d: { git: 'https://github.com/VBA-tools/VBA-Web' },
      e: { git: 'https://github.com/VBA-tools/VBA-Web', branch: 'next' },
      f: { git: 'https://github.com/VBA-tools/VBA-Web', tag: 'v1.0.0' },
      g: { git: 'https://github.com/VBA-tools/VBA-Web', rev: 'a1b2c3d4' }
    }
  };

  expect(parseManifest(value)).toMatchSnapshot();
});

test('throws for invalid dependencies', () => {
  const value: any = { ...BASE_MANIFEST, dependencies: { a: {} } };
  expect(() => parseManifest(value)).toThrow();
});

test('load valid references', () => {
  const value = {
    ...BASE_MANIFEST,
    references: {
      a: {
        version: '1.0',
        guid: '{420B2830-E718-11CF-893D-00A0C9054228}',
        optional: true
      }
    }
  };

  expect(parseManifest(value)).toMatchSnapshot();
});

test('throws for invalid references', () => {
  let value: any = { ...BASE_MANIFEST, references: { a: {} } };
  expect(() => parseManifest(value)).toThrow();

  value = { ...BASE_MANIFEST, references: { b: { version: '1.0.0' } } };
  expect(() => parseManifest(value)).toThrow();

  value = { ...BASE_MANIFEST, references: { c: { version: '1.0' } } };
  expect(() => parseManifest(value)).toThrow();

  value = {
    ...BASE_MANIFEST,
    references: {
      d: { version: '1.0', guid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' }
    }
  };
  expect(() => parseManifest(value)).toThrow();
});

test('loads valid targets', () => {
  const value = {
    ...BASE_MANIFEST,
    targets: [
      { type: 'xlsm', path: 'targets/xlsm' },
      { name: 'addin', type: 'xlam', path: 'targets/xlam' }
    ]
  };

  expect(parseManifest(value)).toMatchSnapshot();
});

test('throws for invalid targets', () => {
  let value: any = { ...BASE_MANIFEST, targets: {} };
  expect(() => parseManifest(value)).toThrow();

  value = { ...BASE_MANIFEST, targets: [{}] };
  expect(() => parseManifest(value)).toThrow();

  value = { ...BASE_MANIFEST, targets: [{ type: 'xlsm' }] };
  expect(() => parseManifest(value)).toThrow();
});

test('loads and parses manifest', async () => {
  const manifest = await loadManifest(join(FIXTURES, 'build'), {
    resolve: false
  });
  expect(manifest).toMatchSnapshot();
});
