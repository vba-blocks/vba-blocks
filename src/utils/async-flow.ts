// TODO Advanced typing to match input and output type from functions
// For now, use simple 1-to-1 mapping

type AsyncFn<TValue> = (input: TValue) => Promise<TValue>;
type Fn<TValue> = (input: TValue) => TValue;

export default function asyncMap<TValue>(
  ...fns: Array<Fn<TValue> | AsyncFn<TValue>>
): AsyncFn<TValue> {
  return value => fns.reduce(async (memo, fn) => fn(await memo), Promise.resolve(value));
}
