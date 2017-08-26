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
  const value = Object.assign(
    {
      src: {
        A: 'src/a.bas',
        B: { path: 'src/b.cls' },
        C: { path: 'src/c.frm', optional: true }
      }
    },
    BASE_MANIFEST
  );

  expect(parseManifest(value)).toMatchSnapshot();
});

test('throws for invalid sources', () => {
  const value = Object.assign(
    {
      src: {
        missing_path: { optional: true }
      }
    },
    BASE_MANIFEST
  );

  expect(() => parseManifest(value)).toThrow();
});

test('loads valid features', () => {
  const value = Object.assign(
    {
      features: {
        default: ['a', 'b'],
        a: { src: ['A'] },
        b: { dependencies: ['B'] },
        c: { references: ['C'] }
      }
    },
    BASE_MANIFEST
  );

  expect(parseManifest(value)).toMatchSnapshot();
});

test('throws for invalid features', () => {
  let value: any = Object.assign(
    { features: { a: { src: 'A' } } },
    BASE_MANIFEST
  );
  expect(() => parseManifest(value)).toThrow();

  value = Object.assign(
    { features: { b: { dependencies: 'B' } } },
    BASE_MANIFEST
  );
  expect(() => parseManifest(value)).toThrow();

  value = Object.assign(
    { features: { c: { references: 'C' } } },
    BASE_MANIFEST
  );
  expect(() => parseManifest(value)).toThrow();
});

test('loads valid dependencies', () => {
  const value = Object.assign(
    {
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
    },
    BASE_MANIFEST
  );

  expect(parseManifest(value)).toMatchSnapshot();
});

test('throws for invalid dependencies', () => {
  const value: any = Object.assign({ dependencies: { a: {} } }, BASE_MANIFEST);
  expect(() => parseManifest(value)).toThrow();
});

test('load valid references', () => {
  const value = Object.assign(
    {
      references: {
        a: {
          version: '1.0',
          guid: '{420B2830-E718-11CF-893D-00A0C9054228}',
          optional: true
        }
      }
    },
    BASE_MANIFEST
  );

  expect(parseManifest(value)).toMatchSnapshot();
});

test('throws for invalid references', () => {
  let value: any = Object.assign({ references: { a: {} } }, BASE_MANIFEST);
  expect(() => parseManifest(value)).toThrow();

  value = Object.assign(
    { references: { b: { version: '1.0.0' } } },
    BASE_MANIFEST
  );
  expect(() => parseManifest(value)).toThrow();

  value = Object.assign(
    { references: { c: { version: '1.0' } } },
    BASE_MANIFEST
  );
  expect(() => parseManifest(value)).toThrow();

  value = Object.assign(
    {
      references: {
        d: { version: '1.0', guid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' }
      }
    },
    BASE_MANIFEST
  );
  expect(() => parseManifest(value)).toThrow();
});

test('loads valid targets', () => {
  const value = Object.assign(
    {
      targets: [
        { type: 'xlsm', path: 'targets/xlsm' },
        { name: 'addin', type: 'xlam', path: 'targets/xlam' }
      ]
    },
    BASE_MANIFEST
  );

  expect(parseManifest(value)).toMatchSnapshot();
});

test('throws for invalid targets', () => {
  let value: any = Object.assign({ targets: {} }, BASE_MANIFEST);
  expect(() => parseManifest(value)).toThrow();

  value = Object.assign({ targets: [{}] }, BASE_MANIFEST);
  expect(() => parseManifest(value)).toThrow();

  value = Object.assign({ targets: [{ type: 'xlsm' }] }, BASE_MANIFEST);
  expect(() => parseManifest(value)).toThrow();
});

test('loads and parses manifest', async () => {
  const manifest = await loadManifest(FIXTURES);
  expect(manifest).toMatchSnapshot();
});
