import path from '../../src/sources/path-source';

test('should match "path" type', () => {
  expect(path.match('registry')).toEqual(false);
  expect(path.match('path')).toEqual(true);
  expect(path.match('git')).toEqual(false);
});

test('should match path dependency', () => {
  expect(
    path.match({
      name: 'path',
      path: './dependency',
      defaultFeatures: true,
      features: []
    })
  ).toEqual(true);

  expect(
    path.match({
      name: 'non-path',
      version: '1.0.0',
      defaultFeatures: true,
      features: []
    })
  ).toEqual(false);
});

test('should resolve path dependency', () => {
  // TODO
});

test('should fetch path dependency', () => {
  // TODO
});
