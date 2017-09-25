export default async function parallel<T>(
  values: T[],
  fn: (value: T) => any | Promise<any>
) {
  const waiting = [];
  for (const value of values) {
    waiting.push(fn(value));
  }

  return await Promise.all(waiting);
}
