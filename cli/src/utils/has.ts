export default function has(value: any, key: string): boolean {
  return !!value && value.hasOwnProperty(key);
}
