export default function last<T>(values: T[]): T | undefined {
  return (
    (values && values.length >= 1 && values[values.length - 1]) || undefined
  );
}
