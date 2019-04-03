type MapFn<TValue> = (value: TValue, index: number, values: TValue[]) => TValue;
type FilterFn<TValue> = (value: TValue, index: number, values: TValue[]) => boolean;

export function pipeMap<TValue>(
  ...fns: MapFn<TValue>[]
): (value: TValue, index: number, values: TValue[]) => TValue {
  return (value, index, values) => fns.reduce((value, fn) => fn(value, index, values), value);
}

export function pipeFilter<TValue>(
  ...fns: FilterFn<TValue>[]
): (value: TValue, index: number, values: TValue[]) => boolean {
  return (value, index, values) =>
    fns.reduce((result, fn) => {
      if (!result) return result;
      return fn(value, index, values);
    }, true);
}
