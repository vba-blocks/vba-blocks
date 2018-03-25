export default function without<T>(values: T[], value: T): T[] {
  const index = values.indexOf(value);
  if (index < 0) return values;

  const removed = values.slice();
  removed.splice(index, 1);

  return removed;
}
