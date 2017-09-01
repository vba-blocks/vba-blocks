export type Iterable = any;

export function forEach(
  iterator: Iterable,
  fn: (item: any, index: number) => any
) {
  let index = 0;
  for (const item of iterator) {
    fn(item, index++);
  }
}

export function map(
  iterator: Iterable,
  fn: (item: any, index: number) => any
): any[] {
  let index = 0;
  const results = [];
  for (const item of iterator) {
    results.push(fn(item, index++));
  }
  return results;
}

export function pluck(values: Iterable, key: string): any[] {
  return map(values, value => value && value[key]);
}

export function reduce<T>(
  iterator: Iterable,
  fn: (memo: T, item: any) => T,
  memo: T
) {
  for (const item of iterator) {
    memo = fn(memo, item);
  }

  return memo;
}

export function unique(values: Iterable): any[] {
  const asSet = new Set(values);
  return Array.from(asSet);
}
