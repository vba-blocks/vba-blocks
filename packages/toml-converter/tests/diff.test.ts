import diff from '../src/diff';

test('diff (array reorder, add, remove)', () => {
  expect(
    diff(
      { a: [1, 2, 3], b: { c: { d: [4, 5, 6] } }, e: [1, 0, 0, 1] },
      { a: [3, 1], b: { c: { d: [7, 6, 5, 4] } }, e: [1, 0, 0, 1] }
    )
  ).toMatchSnapshot();
});

test('diff (array reorder, add, remove with id)', () => {
  expect(
    diff(
      {
        a: [{ key: 1 }, { key: 2 }, { key: 3 }],
        b: { c: { d: [{ key: 4 }, { key: 5 }, { key: 6 }] } },
        e: [{ key: 1 }, { key: 0 }, { key: 0 }, { key: 1 }]
      },
      {
        a: [{ key: 3 }, { key: 1 }],
        b: { c: { d: [{ key: 7 }, { key: 6 }, { key: 5 }, { key: 4 }] } },
        e: [{ key: 1 }, { key: 0 }, { key: 0 }, { key: 1 }]
      },
      { getId: value => value.key }
    )
  ).toMatchSnapshot();
});

test('diff (array reorder and change)', () => {
  expect(
    diff(
      { a: [{ key: 1, index: 0 }, { key: 2, index: 1 }, { key: 3, index: 2 }] },
      { a: [{ key: 3, index: 0 }, { key: 1, index: 1 }] },
      { getId: value => value.key }
    )
  ).toMatchSnapshot();
});
