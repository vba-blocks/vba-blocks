import registry from '../../src/sources/registry-source';

test('should match "registry" type', () => {
  expect(registry.match('registry')).toEqual(true);
  expect(registry.match('path')).toEqual(false);
  expect(registry.match('git')).toEqual(false);
});

test('should match registry dependency', () => {
  expect(
    registry.match({
      name: 'registry',
      version: '1.0.0',
      defaultFeatures: true,
      features: []
    })
  ).toEqual(true);

  expect(
    registry.match({
      name: 'non-registry',
      path: './dependency',
      defaultFeatures: true,
      features: []
    })
  ).toEqual(false);
});

test('should resolve registry dependency', () => {
  // TODO
});

test('should fetch registry dependency', () => {
  // TODO
});
