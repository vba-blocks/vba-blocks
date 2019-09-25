import {
  getLocalPackage,
  getRemotePackage,
  getSource,
  sanitizePackageName
} from '../registry-source';

test('should resolve registry dependency', () => {
  // TODO
});

test('should fetch registry dependency', () => {
  // TODO
});

describe('utils', () => {
  const dictionary = {
    name: 'vba-tools/dictionary',
    version: '1.0.0',
    dependencies: [],
    id: 'dictionary@1.0.0',
    source: ''
  };

  test('should sanitize package name', () => {
    expect(sanitizePackageName('json')).toEqual('json');
    expect(sanitizePackageName('vba-tools/json')).toEqual('vba-tools/json');
    expect(sanitizePackageName('vba-tools/a/b')).toEqual('vba-tools/a--b');
    expect(sanitizePackageName('a/b.c\\d:e*f"g>h<i|j')).toEqual('a/b.c-d-e-f-g-h-i-j');
  });

  test('should get remote package url', () => {
    expect(getRemotePackage('https://packages.vba-blocks.com', dictionary)).toEqual(
      'https://packages.vba-blocks.com/vba-tools/dictionary-v1.0.0.block'
    );
  });

  test('should get local package path', () => {
    expect(getLocalPackage('.vba-blocks/packages', dictionary)).toEqual(
      '.vba-blocks/packages/vba-tools/dictionary-v1.0.0.block'
    );
  });

  test('should get source path', () => {
    expect(getSource('.vba-blocks/sources', dictionary)).toEqual(
      '.vba-blocks/sources/vba-tools/dictionary-v1.0.0'
    );
  });
});
