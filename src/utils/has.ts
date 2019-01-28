export default function has(value: object | undefined | null, key: string): boolean {
  return !!value && typeof value.hasOwnProperty === 'function' && value.hasOwnProperty(key);
}
