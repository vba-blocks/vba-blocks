export default function truncate(value: string, len: number): string {
  return value.length > len ? `${value.slice(0, len)}...` : value;
}
