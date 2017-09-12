export default async function parallel(values, fn) {
  const waiting = [];
  for (const value of values) {
    waiting.push(fn(value));
  }

  return await Promise.all(waiting);
}
