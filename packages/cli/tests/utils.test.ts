import { convertToToml, escape } from '../src/utils';

test('convertToToml', () => {
  expect(
    convertToToml({
      root: {
        name: 'project',
        dependencies: ['a 1.2.3']
      },
      project: [],
      package: [
        {
          name: 'a',
          version: '1.2.3',
          source: 'registry+...#...',
          dependencies: ['d 0.0.0']
        },
        {
          name: 'b',
          version: '4.5.6',
          source: 'path+...'
        },
        {
          name: 'c',
          version: '7.8.9',
          source: 'git+...#rev'
        },
        {
          name: 'd',
          version: '0.0.0',
          source: 'registry+...#...'
        }
      ]
    })
  ).toMatchSnapshot();
});

test('should escape quotes and spaces', () => {
  expect(escape(`" '!?a1`)).toEqual(`|Q||S|'!?a1`);
});
