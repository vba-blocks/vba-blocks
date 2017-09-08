export default function last<T>(values: T[]): T {
  return values && values.length >= 1 && values[values.length - 1];
}
