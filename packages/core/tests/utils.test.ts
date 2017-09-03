import { convertToToml } from '../src/utils';

test('convertToToml', () => {
  expect(
    convertToToml({
      package: [
        {
          name: 'a',
          version: '1.2.3',
          source: 'registry+...',
          checksum: '...',
          dependencies: ['d 0.0.0 (registry+...)']
        },
        {
          name: 'b',
          version: '4.5.6'
        },
        {
          name: 'c',
          version: '7.8.9',
          source: 'git+...',
          checksum: '<none>'
        },
        {
          name: 'd',
          version: '0.0.0',
          source: 'registry+...',
          checksum: '...'
        }
      ]
    })
  ).toMatchSnapshot();
});
