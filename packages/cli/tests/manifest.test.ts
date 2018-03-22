import { join, relative } from 'path';
import { unixPath } from '../src/utils';
import { Manifest, parseManifest, loadManifest } from '../src/manifest';
import { isPathDependency } from '../src/manifest/dependency';

const BASE_MANIFEST = {
  package: { name: 'package-name', version: '1.0.0', authors: ['Tim Hall'] }
};

const FIXTURES = join(__dirname, 'fixtures');

test('loads valid package metadata', () => {
  expect(normalize(parseManifest(BASE_MANIFEST, FIXTURES))).toMatchSnapshot();
});

test('throws for invalid package metadata', () => {
  expect(() => parseManifest({}, FIXTURES)).toThrow();
  expect(() => parseManifest({ package: {} }, FIXTURES)).toThrow();
  expect(() =>
    parseManifest({ package: { name: 'package-name' } }, FIXTURES)
  ).toThrow();
  expect(() =>
    parseManifest({ package: { version: '1.0.0' } }, FIXTURES)
  ).toThrow();
  expect(() =>
    parseManifest({ package: { authors: ['Tim Hall'] } }, FIXTURES)
  ).toThrow();
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

  expect(normalize(parseManifest(value, FIXTURES))).toMatchSnapshot();
});

test('throws for invalid sources', () => {
  const value = {
    ...BASE_MANIFEST,
    src: {
      missing_path: { optional: true }
    }
  };

  expect(() => parseManifest(value, FIXTURES)).toThrow();
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

  expect(normalize(parseManifest(value, FIXTURES))).toMatchSnapshot();
});

test('throws for invalid features', () => {
  let value: any = { ...BASE_MANIFEST, features: { a: { src: 'A' } } };
  expect(() => parseManifest(value, FIXTURES)).toThrow();

  value = { ...BASE_MANIFEST, features: { b: { dependencies: 'B' } } };
  expect(() => parseManifest(value, FIXTURES)).toThrow();

  value = { ...BASE_MANIFEST, features: { c: { references: 'C' } } };
  expect(() => parseManifest(value, FIXTURES)).toThrow();
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

  expect(normalize(parseManifest(value, FIXTURES))).toMatchSnapshot();
});

test('throws for invalid dependencies', () => {
  const value: any = { ...BASE_MANIFEST, dependencies: { a: {} } };
  expect(() => parseManifest(value, FIXTURES)).toThrow();
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

  expect(normalize(parseManifest(value, FIXTURES))).toMatchSnapshot();
});

test('throws for invalid references', () => {
  let value: any = { ...BASE_MANIFEST, references: { a: {} } };
  expect(() => parseManifest(value, FIXTURES)).toThrow();

  value = { ...BASE_MANIFEST, references: { b: { version: '1.0.0' } } };
  expect(() => parseManifest(value, FIXTURES)).toThrow();

  value = { ...BASE_MANIFEST, references: { c: { version: '1.0' } } };
  expect(() => parseManifest(value, FIXTURES)).toThrow();

  value = {
    ...BASE_MANIFEST,
    references: {
      d: { version: '1.0', guid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' }
    }
  };
  expect(() => parseManifest(value, FIXTURES)).toThrow();
});

test('loads valid targets', () => {
  const value = {
    ...BASE_MANIFEST,
    targets: [
      { type: 'xlsm', path: 'targets/xlsm' },
      { name: 'addin', type: 'xlam', path: 'targets/xlam' }
    ]
  };

  expect(normalize(parseManifest(value, FIXTURES))).toMatchSnapshot();
});

test('throws for invalid targets', () => {
  let value: any = { ...BASE_MANIFEST, targets: {} };
  expect(() => parseManifest(value, FIXTURES)).toThrow();

  value = { ...BASE_MANIFEST, targets: [{}] };
  expect(() => parseManifest(value, FIXTURES)).toThrow();

  value = { ...BASE_MANIFEST, targets: [{ type: 'xlsm' }] };
  expect(() => parseManifest(value, FIXTURES)).toThrow();
});

test('loads and parses manifest', async () => {
  const manifest = await loadManifest(join(FIXTURES, 'project'));
  expect(normalize(manifest, join(FIXTURES, 'project'))).toMatchSnapshot();
});

function normalize(
  manifest: Manifest,
  relativeTo: string = FIXTURES
): Manifest {
  manifest.dir = normalizePath(manifest.dir, relativeTo);

  for (const src of manifest.src) {
    src.path = normalizePath(src.path, relativeTo);
  }
  for (const target of manifest.targets) {
    target.path = normalizePath(target.path, relativeTo);
  }
  for (const dependency of manifest.dependencies) {
    if (isPathDependency(dependency)) {
      dependency.path = normalizePath(dependency.path, relativeTo);
    }
  }

  return manifest;
}

function normalizePath(path: string, relativeTo: string = FIXTURES): string {
  return unixPath(relative(relativeTo, path));
}
