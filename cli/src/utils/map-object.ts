export default function mapObject(
  obj: any,
  fn: (value: any, key: string, obj: any) => any
): any[] {
  if (!obj) return [];

  return Object.keys(obj).map(key => {
    return fn(obj[key], key, obj);
  });
}
