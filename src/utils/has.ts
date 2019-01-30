export default function has(value: object | undefined | null, key: string): boolean {
  return !!value && Object.hasOwnProperty.call(value, key);
}
