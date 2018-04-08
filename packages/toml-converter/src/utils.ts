export function toLines(value: string): string[] {
  return value.replace(/\r/g, '').split('\n');
}
