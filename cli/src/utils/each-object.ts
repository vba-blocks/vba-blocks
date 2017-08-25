export default function eachObject(
  obj: any,
  fn: (value: any, key: string, obj: any) => void
) {
  if (!obj) return;

  Object.keys(obj).forEach(key => {
    fn(obj[key], key, obj);
  });
}
