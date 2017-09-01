import { convertToToml } from '../src/utils';

test('convertToToml', () => {
  expect(
    convertToToml({
      root: {
        name: 'my-package',
        version: '1.0.0',
        dependencies: ['a 1.2.3 (registry+...)', 'b 4.5.6', 'c 7.8.9 (git+...)']
      },
      package: [
        {
          name: 'a',
          version: '1.2.3',
          source: 'registry+...',
          dependencies: ['d 0.0.0 (registry+...)']
        },
        {
          name: 'b',
          version: '4.5.6'
        },
        {
          name: 'c',
          version: '7.8.9',
          source: 'git+...'
        },
        {
          name: 'd',
          version: '0.0.0',
          source: 'registry+...'
        }
      ],
      metadata: {
        'checksum a 1.2.3 (registry+...)': '...',
        'checksum c 7.8.9 (git+...)': '<none>',
        'checksum d 0.0.0 (registry+...)': '...'
      }
    })
  ).toMatchSnapshot();
});
